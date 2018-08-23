pragma solidity ^0.4.24;

library LinkedAddressList {
  struct Item {
    address data;
    bytes32 prev;
    bytes32 next;
  }

  struct List {
    mapping (bytes32 => Item) items;
    bytes32 head;
    bytes32 tail;
    uint size;
  }

  function getData(List storage self, bytes32 id) internal view returns(address) {
    return self.items[id].data;
  }

  function getHeadData(List storage self) internal view returns(address) {
    return self.items[self.head].data;
  }

  function getTailData(List storage self) internal view returns(address) {
    return self.items[self.tail].data;
  }

  function addFirst(List storage self, address data) internal {
    bytes32 id = keccak256(abi.encodePacked(data,now,self.head));
    self.items[id] = Item({data: data, prev: 0, next: self.head});
    self.head = id;
    if (self.tail == 0) {
      self.tail = id;
    }
    self.size++;
  }

  function addLast(List storage self, address data) internal {
    bytes32 id = keccak256(abi.encodePacked(data,now,self.tail));
    self.items[id] = Item({data: data, prev: self.tail, next: 0});
    if (self.tail != 0) {
      self.items[self.tail].next = id;
    }
    self.tail = id;
    if (self.head == 0) {
      self.head = id;
    }
    self.size++;
  }

  function removeFirst(List storage self) internal returns(address) {
    require(self.head != 0);
    Item memory item = self.items[self.head];
    delete self.items[self.head];
    self.head = item.next;
    self.size--;
    return item.data;
  }

  function removeLast(List storage self) internal returns(address) {
    require(self.tail != 0);
    Item memory item = self.items[self.tail];
    delete self.items[self.tail];
    self.tail = item.prev;
    self.size--;
    return item.data;
  }
}