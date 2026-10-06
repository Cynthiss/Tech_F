// SPDX-License-Identifier: MIT
pragma solidity ^0.8.36;

import {Test} from "forge-std/Test.sol";
import {ClassToken} from "../src/ClassToken.sol";
import {ClassVesting} from "../src/ClassVesting.sol";

contract ClassVestingTest is Test {
    ClassToken token;
    ClassVesting vesting;

    address deployer = address(this);
    address[] beneficiaries;

    uint256 constant CLIFF_TIMESTAMP = 1790186400; // mié 23 Sep 2026, 12:00 GT
    uint256 constant END_TIMESTAMP = 1790272800; // jue 24 Sep 2026, 12:00 GT
    uint256 constant CLIFF_AMOUNT = 100 ether;
    uint256 constant TOTAL_ALLOCATION = 1_000 ether;

    address outsider = address(0xBEEF);

    function setUp() public {
        beneficiaries = new address[](7);
        for (uint256 i = 0; i < 7; i++) {
            beneficiaries[i] = address(uint160(0x1000 + i));
        }

        token = new ClassToken();
        vesting = new ClassVesting(address(token), beneficiaries, CLIFF_TIMESTAMP, END_TIMESTAMP);
        require(token.transfer(address(vesting), token.TOTAL_SUPPLY()), "funding transfer failed");

        vm.warp(CLIFF_TIMESTAMP - 7 days);
    }

    function test_TotalSupplyIs7000() public view {
        assertEq(token.totalSupply(), 7_000 ether);
    }

    function test_VestingIsFundedWithFullSupply() public view {
        assertEq(token.balanceOf(address(vesting)), 7_000 ether);
    }

    function test_EachBeneficiaryHasAllocation1000() public view {
        for (uint256 i = 0; i < beneficiaries.length; i++) {
            assertTrue(vesting.isBeneficiary(beneficiaries[i]));
            assertEq(vesting.TOTAL_ALLOCATION(), TOTAL_ALLOCATION);
        }
    }

    function test_NonBeneficiaryHasNoAllocation() public view {
        assertFalse(vesting.isBeneficiary(outsider));
        assertEq(vesting.vestedAmount(outsider), 0);
        assertEq(vesting.releasable(outsider), 0);
    }

    function test_NothingBeforeCliff() public {
        address alice = beneficiaries[0];

        assertEq(vesting.releasable(alice), 0);

        vm.warp(CLIFF_TIMESTAMP - 1);
        assertEq(vesting.releasable(alice), 0);

        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(ClassVesting.NothingToClaim.selector, alice));
        vesting.claim();
    }

    function test_CliffUnlocks100() public {
        address alice = beneficiaries[0];

        vm.warp(CLIFF_TIMESTAMP);
        assertEq(vesting.releasable(alice), CLIFF_AMOUNT);

        vm.prank(alice);
        vesting.claim();

        assertEq(token.balanceOf(alice), CLIFF_AMOUNT);
        assertEq(vesting.claimed(alice), CLIFF_AMOUNT);
        assertEq(vesting.releasable(alice), 0);
    }

    function test_LinearDuringDay() public {
        address alice = beneficiaries[0];

        // Halfway through the post-cliff day: 100 (cliff) + 450 (half of 900).
        vm.warp(CLIFF_TIMESTAMP + 12 hours);
        assertEq(vesting.releasable(alice), CLIFF_AMOUNT + 450 ether);

        vm.prank(alice);
        vesting.claim();
        assertEq(token.balanceOf(alice), CLIFF_AMOUNT + 450 ether);

        // A quarter later: another 225 should have accrued.
        vm.warp(CLIFF_TIMESTAMP + 18 hours);
        assertEq(vesting.releasable(alice), 225 ether);

        vm.prank(alice);
        vesting.claim();
        assertEq(vesting.claimed(alice), CLIFF_AMOUNT + 675 ether);
    }

    function test_FullAtEnd() public {
        address alice = beneficiaries[0];

        vm.warp(END_TIMESTAMP);
        assertEq(vesting.releasable(alice), TOTAL_ALLOCATION);

        vm.prank(alice);
        vesting.claim();
        assertEq(token.balanceOf(alice), TOTAL_ALLOCATION);

        // Idempotent: nothing left after full claim, even well past the end.
        vm.warp(END_TIMESTAMP + 30 days);
        assertEq(vesting.releasable(alice), 0);

        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(ClassVesting.NothingToClaim.selector, alice));
        vesting.claim();
    }

    function test_CannotClaimOthers() public {
        address alice = beneficiaries[0];
        address bob = beneficiaries[1];

        vm.warp(END_TIMESTAMP);

        // Bob claims his own allocation...
        vm.prank(bob);
        vesting.claim();
        assertEq(token.balanceOf(bob), TOTAL_ALLOCATION);

        // ...and Alice's allocation is completely untouched: claim() only ever
        // credits msg.sender, there is no beneficiary parameter to spoof.
        assertEq(token.balanceOf(alice), 0);
        assertEq(vesting.releasable(alice), TOTAL_ALLOCATION);

        // A non-beneficiary can never claim anything either.
        vm.prank(outsider);
        vm.expectRevert(abi.encodeWithSelector(ClassVesting.NotBeneficiary.selector, outsider));
        vesting.claim();
    }

    function test_RevertOnDuplicateBeneficiary() public {
        address[] memory dup = new address[](2);
        dup[0] = address(0xA);
        dup[1] = address(0xA);

        vm.expectRevert(abi.encodeWithSelector(ClassVesting.DuplicateBeneficiary.selector, address(0xA)));
        new ClassVesting(address(token), dup, CLIFF_TIMESTAMP, END_TIMESTAMP);
    }

    function test_RevertOnZeroAddressBeneficiary() public {
        address[] memory withZero = new address[](1);
        withZero[0] = address(0);

        vm.expectRevert(ClassVesting.ZeroAddressBeneficiary.selector);
        new ClassVesting(address(token), withZero, CLIFF_TIMESTAMP, END_TIMESTAMP);
    }

    function test_RevertOnInvalidTimestamps() public {
        vm.expectRevert(abi.encodeWithSelector(ClassVesting.InvalidTimestamps.selector, END_TIMESTAMP, CLIFF_TIMESTAMP));
        new ClassVesting(address(token), beneficiaries, END_TIMESTAMP, CLIFF_TIMESTAMP);
    }

    function test_fuzz_ReleasableNeverExceedsAllocation(uint256 warpTo) public {
        address alice = beneficiaries[0];
        warpTo = bound(warpTo, 0, CLIFF_TIMESTAMP + 3650 days);
        vm.warp(warpTo);

        assertLe(vesting.vestedAmount(alice), TOTAL_ALLOCATION);
    }
}
