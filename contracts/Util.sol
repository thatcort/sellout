pragma solidity ^0.4.24;

contract Owned {
  address public owner;

  constructor() public {
    owner = msg.sender;
  }

  modifier onlyOwner {
      require(msg.sender == owner, 'Only owner can call this function');
      _;
  }
}

contract Mortal is Owned {
  function kill() public onlyOwner {
    selfdestruct(owner);
  }
}

contract Stoppable is Owned {
  
  bool isStopped = false;

  modifier stopped() {
    require(isStopped);
    _;
  }

  modifier running() {
    require(!isStopped);
    _;
  }

  function stopContract() public onlyOwner {
    isStopped = true;
  }

  function resumeContract() public onlyOwner {
    isStopped = false;
  }

  function deposit() public payable stopped returns(bool) {
    return true;
  }

  function withdrawal() public stopped onlyOwner {
    owner.transfer(address(this).balance);
  }
}

contract AccessRestriction {
  
  modifier onlyBy(address _account) {
    require(msg.sender == _account);
    _;
  }

  modifier onlyAfter(uint _time) {
    require(now >= _time);
    _;
  }

  modifier canAfford(uint cost) {
    require(msg.value >= cost);
    _;
  }

  modifier costs(uint _amount) {
    _;
    if (msg.value > _amount) {
      msg.sender.transfer(msg.value - _amount);
    }
  }
}

contract Expires {
  
  modifier notExpired(uint expiry) {
    require(now < expiry, 'Contract expired');
    _;
  }

  modifier expired(uint expiry) {
    require(now >= expiry, 'Contract not expired');
    _;
  }
}
