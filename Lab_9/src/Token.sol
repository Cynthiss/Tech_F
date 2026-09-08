// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Token is ERC20 {
    address public feeReceiver;

    constructor(address _feeReceiver) ERC20("Lab Token", "LAB") {
        feeReceiver = _feeReceiver;

        _mint(msg.sender, 1_000_000 * 10 ** decimals());
    }

    function _update(address from, address to, uint256 value) internal override {
        // Mint o Burn
        if (from == address(0) || to == address(0)) {
            super._update(from, to, value);
            return;
        }

        uint256 fee = value / 100; // 1%
        uint256 amountAfterFee = value - fee;

        super._update(from, feeReceiver, fee);
        super._update(from, to, amountAfterFee);
    }
}
