// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";
import {Token} from "../src/Token.sol";

contract TokenTest is Test {
    Token token;

    address owner = address(1);
    address alice = address(2);
    address bob = address(3);
    address feeReceiver = address(4);

    function setUp() public {
        vm.prank(owner);
        token = new Token(feeReceiver);

        // Owner envía 1000 tokens a Alice.
        // Con el fee del 1%, Alice recibe 990 y feeReceiver recibe 10.
        vm.prank(owner);
        token.transfer(alice, 1000 ether);
    }

    function test_transfer_sends_fee() public {
        // Alice envía 100 tokens a Bob.
        // Bob recibe 99 y feeReceiver recibe 1 adicional.
        vm.prank(alice);
        token.transfer(bob, 100 ether);

        assertEq(token.balanceOf(bob), 99 ether);
        assertEq(token.balanceOf(feeReceiver), 11 ether);
        assertEq(token.balanceOf(alice), 890 ether);
    }

    function test_fuzz_transfer_sends_correct_fee(uint256 amount) public {
        amount = bound(amount, 1 ether, 500 ether);

        uint256 feeBefore = token.balanceOf(feeReceiver);

        vm.prank(alice);
        token.transfer(bob, amount);

        uint256 fee = amount / 100;
        uint256 received = amount - fee;

        assertEq(token.balanceOf(bob), received);
        assertEq(token.balanceOf(feeReceiver), feeBefore + fee);
    }

    function invariant_totalSupplyNeverChanges() public view {
        assertEq(token.totalSupply(), 1_000_000 ether);
    }
}