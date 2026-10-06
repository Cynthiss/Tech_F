// SPDX-License-Identifier: MIT
pragma solidity ^0.8.36;

import {Script, console} from "forge-std/Script.sol";
import {ClassVesting} from "../src/ClassVesting.sol";

/// @notice Homework script: each student claims their own releasable tokens
/// from the class-wide ClassVesting deploy. `claim()` always credits
/// msg.sender — there is no way to pass a different beneficiary address, so
/// running this with your own private key is the only way to get your own
/// tokens (never someone else's).
///
/// Run:
///   VESTING=0x... BENEFICIARY=0xYourWallet forge script script/Claim.s.sol:Claim \
///     --rpc-url $RPC_URL --broadcast --private-key $YOUR_PRIVATE_KEY
contract Claim is Script {
    function run() external {
        address vestingAddress = vm.envAddress("VESTING");
        address me = vm.envAddress("BENEFICIARY");
        ClassVesting vesting = ClassVesting(vestingAddress);

        console.log("Releasable before claim:", vesting.releasable(me));

        vm.startBroadcast();
        vesting.claim();
        vm.stopBroadcast();

        console.log("Total claimed so far:", vesting.claimed(me));
    }
}
