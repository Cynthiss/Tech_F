// SPDX-License-Identifier: MIT
pragma solidity ^0.8.36;

import {Script, console} from "forge-std/Script.sol";
import {ClassToken} from "../src/ClassToken.sol";
import {ClassVesting} from "../src/ClassVesting.sol";
import {Beneficiaries} from "./Beneficiaries.s.sol";

/// @notice Deploys CS031 Lab 12 (Sesión 14) once for the whole class:
///   1. ClassToken — fixed supply of 7_000, minted to the deployer.
///   2. ClassVesting — registers the 7 beneficiaries from Beneficiaries.s.sol
///      with the absolute cliff/end timestamps below.
///   3. Funds the vesting contract with the full 7_000 tokens.
///
/// Run (example, anvil):
///   forge script script/DeployClassVesting.s.sol:DeployClassVesting \
///     --rpc-url $RPC_URL --broadcast --private-key $PRIVATE_KEY
contract DeployClassVesting is Script {
    // miércoles 23 septiembre 2026, 12:00 America/Guatemala (GT)
    uint256 public constant CLIFF_TIMESTAMP = 1790186400;
    // jueves 24 septiembre 2026, 12:00 America/Guatemala (GT)
    uint256 public constant END_TIMESTAMP = 1790272800;

    function run() external returns (ClassToken token, ClassVesting vesting) {
        address[] memory beneficiaries = Beneficiaries.get();

        vm.startBroadcast();

        token = new ClassToken();
        vesting = new ClassVesting(address(token), beneficiaries, CLIFF_TIMESTAMP, END_TIMESTAMP);
        require(token.transfer(address(vesting), token.TOTAL_SUPPLY()), "funding transfer failed");

        vm.stopBroadcast();

        console.log("ClassToken deployed at:", address(token));
        console.log("ClassVesting deployed at:", address(vesting));
        console.log("Vesting funded with:", token.balanceOf(address(vesting)));
        console.log("Cliff timestamp (GT 23 Sep 2026 12:00):", CLIFF_TIMESTAMP);
        console.log("End timestamp   (GT 24 Sep 2026 12:00):", END_TIMESTAMP);
    }
}
