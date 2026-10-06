// SPDX-License-Identifier: MIT
pragma solidity ^0.8.36;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @notice Fixed-supply ERC-20 for CS031 Lab 12 (Sesión 14 — vesting de clase).
/// Mints the full 7_000-token supply to the deployer, who then funds the
/// ClassVesting contract in the same deploy script (see script/DeployClassVesting.s.sol).
contract ClassToken is ERC20 {
    uint256 public constant TOTAL_SUPPLY = 7_000 * 10 ** 18;

    constructor() ERC20("CS031 Class Token", "CS031") {
        _mint(msg.sender, TOTAL_SUPPLY);
    }
}
