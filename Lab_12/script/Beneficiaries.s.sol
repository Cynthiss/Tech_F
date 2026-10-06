// SPDX-License-Identifier: MIT
pragma solidity ^0.8.36;

/// @notice Roster for CS031 Lab 12 (Sesión 14 — vesting de clase).
/// FILL IN the 7 real wallet addresses collected in clase before running the
/// real deploy (DeployClassVesting.s.sol). Order doesn't matter — every
/// address gets the same 1_000-token allocation.
library Beneficiaries {
    function get() internal pure returns (address[] memory list) {
        list = new address[](7);

        // TODO: reemplazar cada placeholder con la wallet real de cada estudiante.
        list[0] = address(uint160(0x01)); // Estudiante 1
        list[1] = address(uint160(0x02)); // Estudiante 2
        list[2] = address(uint160(0x03)); // Estudiante 3
        list[3] = address(uint160(0x04)); // Estudiante 4
        list[4] = address(uint160(0x05)); // Estudiante 5
        list[5] = address(uint160(0x06)); // Estudiante 6
        list[6] = address(uint160(0x07)); // Estudiante 7
    }
}
