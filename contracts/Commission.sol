pragma solidity ^0.4.24;

import './Util.sol';

contract Commission is AccessRestriction, Expires {

  enum States {
    CREATED,
    FUNDED,
    STARTED,
    READY,
    REFUNDED
  }

  modifier isState(States s) {
    require(state == s);
    _;
  }

  modifier notState(States s) {
    require(state != s);
    _;
  }

  address public artist;
  address public agent;
  address public patron;
  uint16 public width;
  uint16 public height;
  uint public deadline;
  uint public price;
  uint public agentCut;
  States public state;
  bytes32 location;
  bool paid = false;


  event Created(address indexed artist, address indexed patron, address indexed agent);
  event Funded(address indexed artist, address indexed patron, address indexed agent);
  event Started(address indexed artist, address indexed patron, address indexed agent);
  event Ready(address indexed artist, address indexed patron, address indexed agent, bytes32 location);
  event Refunded(address indexed artist, address indexed patron, address indexed agent, uint amount);

  constructor(
        address _artist,
        address _agent,
        address _patron,
        uint16 _width,
        uint16 _height,
        uint _deadline,
        uint _price,
        uint _agentCut) public {
    artist = _artist;
    patron = _patron;
    agent = _agent;
    width = _width;
    height = _height;
    deadline = _deadline;
    price = _price;
    agentCut = _agentCut;
    state = States.CREATED;
    emit Created(artist, patron, agent);
  }

  /** Anyone can fund an art piece. Note that only the patron can refund it, though. */
  function fund() public payable notExpired(deadline) isState(States.CREATED) returns(bool) {
    if (address(this).balance >= price) {
      state = States.FUNDED;
      emit Funded(artist, patron, agent);
    }
    return true;
  }

  /** If expired without the artist creating the work in time, the patron can get their money back */
  function refund() public onlyBy(patron) expired(deadline) notState(States.READY) notState(States.REFUNDED) {
    uint bal = address(this).balance;
    uint amt = (bal < price ? bal : price); // Refund up to a maximum of the price of the commission
    state = States.REFUNDED;
    patron.transfer(amt);
    emit Refunded(artist, patron, agent, amt);
    if (bal > amt) {
      artist.send(bal - amt); // send any overpayment to the artist as a tip
    }
  }

  function payout() internal isState(States.READY) {
    require(paid == false);
    paid = true;
    agent.transfer(agentCut);
    artist.transfer(address(this).balance);
  }

  /** Called by artist to inform that it is starting to create the work */
  function notifyStarting() public onlyBy(artist) notExpired(deadline) isState(States.FUNDED) {
    state = States.STARTED;
    emit Started(artist, patron, agent);
  }

  /** Called by the artist to inform that the work is completed. Delivers the location of the work */
  function notifyReady(bytes32 _location) public onlyBy(artist) notExpired(deadline) isState(States.STARTED) {
    location = _location;
    state = States.READY;
    payout();
    emit Ready(artist, patron, agent, location);
  }

  /** 
  * Eventually the location should be ecrypted so only the patron can view it,
  * but no time and also this: https://github.com/ethereum/EIPs/pull/1098
  */
  function getArtLocation() public view onlyBy(patron) isState(States.READY) returns(bytes32) {
    return location;
  }

  /** Redirect payments to the funding logic */
  function() payable public {
    fund();
  }
}