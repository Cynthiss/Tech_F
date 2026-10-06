// SPDX-License-Identifier: MIT
pragma solidity ^0.8.36;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/// @title ClassVesting
/// @notice CS031 Lab 12 (Sesión 14) — single class-wide vesting for a fixed roster
/// of beneficiaries. Each beneficiary is allocated the same amount: `CLIFF_AMOUNT`
/// unlocks at `cliffTimestamp`, and the remaining `TOTAL_ALLOCATION - CLIFF_AMOUNT`
/// unlocks linearly between `cliffTimestamp` and `endTimestamp`. Every wallet can
/// only ever claim its own releasable balance (`claim()` uses msg.sender, no
/// address parameter). The beneficiary list, allocation, and timestamps are fixed
/// at deploy time — there is no admin function to add beneficiaries or change terms
/// after construction.
contract ClassVesting {
    using SafeERC20 for IERC20;

    uint256 public constant TOTAL_ALLOCATION = 1_000 * 10 ** 18;
    uint256 public constant CLIFF_AMOUNT = 100 * 10 ** 18;
    uint256 public constant LINEAR_AMOUNT = TOTAL_ALLOCATION - CLIFF_AMOUNT;

    IERC20 public immutable token;
    uint256 public immutable cliffTimestamp;
    uint256 public immutable endTimestamp;

    mapping(address beneficiary => bool registered) public isBeneficiary;
    mapping(address beneficiary => uint256 claimed) public claimed;

    event Claimed(address indexed beneficiary, uint256 amount);

    error NotBeneficiary(address account);
    error NoBeneficiaries();
    error ZeroAddressBeneficiary();
    error DuplicateBeneficiary(address account);
    error InvalidTimestamps(uint256 cliffTimestamp, uint256 endTimestamp);
    error NothingToClaim(address account);

    /// @param token_ ERC-20 already holding (or about to be funded with)
    ///   `beneficiaries.length * TOTAL_ALLOCATION` tokens.
    /// @param beneficiaries_ Roster of student wallet addresses, one allocation each.
    /// @param cliffTimestamp_ Absolute unix timestamp when CLIFF_AMOUNT unlocks.
    /// @param endTimestamp_ Absolute unix timestamp when the full allocation is vested.
    constructor(address token_, address[] memory beneficiaries_, uint256 cliffTimestamp_, uint256 endTimestamp_) {
        if (beneficiaries_.length == 0) revert NoBeneficiaries();
        if (endTimestamp_ <= cliffTimestamp_) revert InvalidTimestamps(cliffTimestamp_, endTimestamp_);

        token = IERC20(token_);
        cliffTimestamp = cliffTimestamp_;
        endTimestamp = endTimestamp_;

        for (uint256 i = 0; i < beneficiaries_.length; i++) {
            address beneficiary = beneficiaries_[i];
            if (beneficiary == address(0)) revert ZeroAddressBeneficiary();
            if (isBeneficiary[beneficiary]) revert DuplicateBeneficiary(beneficiary);
            isBeneficiary[beneficiary] = true;
        }
    }

    /// @notice Tokens vested for `account` so far, regardless of how much was claimed.
    function vestedAmount(address account) public view returns (uint256) {
        if (!isBeneficiary[account]) return 0;

        if (block.timestamp < cliffTimestamp) {
            return 0;
        } else if (block.timestamp >= endTimestamp) {
            return TOTAL_ALLOCATION;
        } else {
            uint256 elapsed = block.timestamp - cliffTimestamp;
            uint256 duration = endTimestamp - cliffTimestamp;
            return CLIFF_AMOUNT + (LINEAR_AMOUNT * elapsed) / duration;
        }
    }

    /// @notice Amount `account` could claim right now.
    function releasable(address account) public view returns (uint256) {
        return vestedAmount(account) - claimed[account];
    }

    /// @notice Claim the caller's own releasable tokens. Reverts if the caller is
    /// not a registered beneficiary or if there is nothing to release yet.
    function claim() external {
        if (!isBeneficiary[msg.sender]) revert NotBeneficiary(msg.sender);

        uint256 amount = releasable(msg.sender);
        if (amount == 0) revert NothingToClaim(msg.sender);

        claimed[msg.sender] += amount;
        token.safeTransfer(msg.sender, amount);

        emit Claimed(msg.sender, amount);
    }
}
