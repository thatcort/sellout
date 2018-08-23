pragma solidity ^0.4.24;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/LinkedAddressList.sol";

import "../contracts/libraries/strings.sol";

contract TestLinkedAddressList {

  using LinkedAddressList for LinkedAddressList.List;
  using strings for *;

  LinkedAddressList.List list;

  function addressToString(address x) public pure returns (string) {
    bytes memory b = new bytes(20);
    for (uint i = 0; i < 20; i++)
      b[i] = byte(uint8(uint(x) / (2**(8*(19 - i)))));
    return string(b);
  }

  function testAddRemoveHead() public {
    // LinkedAddressList LAL = LinkedAddressList(DeployedAddresses.LinkedAddressList());

    Assert.equal(list.getHeadData(), address(0), "Empty list should return address 0 for head data.");

    address testAddress = address(123);
    list.addFirst(testAddress);

    Assert.equal(list.getHeadData(), testAddress, "It should retrieve the address 123.");
    Assert.equal(list.getTailData(), testAddress, "It should retrieve the address 123.");

    address removed = list.removeFirst();

    Assert.equal(removed, testAddress, "Removed head should match added head. Instead found: ".toSlice().concat(addressToString(removed).toSlice()));
    Assert.equal(list.getHeadData(), address(0), "Empty list should return address 0 for head data.");
  }

  function testAddRemoveTail() public {
    // LinkedAddressList LAL = LinkedAddressList(DeployedAddresses.LinkedAddressList());
    // LinkedAddressList.List storage list;

    Assert.equal(list.getTailData(), address(0), "Empty list should return address 0 for tail data.");

    address testAddress = address(123);
    list.addLast(testAddress);

    Assert.equal(list.getTailData(), testAddress, "It should retrieve the address 123.");
    Assert.equal(list.getHeadData(), testAddress, "It should retrieve the address 123.");

    address removed = list.removeLast();

    Assert.equal(removed, testAddress, "Removed tail should match added tail. Instead found: ".toSlice().concat(addressToString(removed).toSlice()));
    Assert.equal(list.getTailData(), address(0), "Empty list should return address 0 for tail data.");
  }

  // function testAddRemoveMultiple() public {
  //   LinkedAddressList LAL = LinkedAddressList(DeployedAddresses.LinkedAddressList());
  //   LinkedAddressList.List storage list;

  //   address a1 = address(123);
  //   address a2 = address(234);
  //   address a3 = address(345);
  //   address a4 = address(456);

  //   list.addFirst(a1);
  //   list.addLast(a2);

  //   Assert()
  // }

}