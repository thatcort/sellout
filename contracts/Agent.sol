pragma solidity ^0.4.24;

import './Util.sol';
import './Commission.sol';

contract Agent is Stoppable, Mortal {

  address public artist;
  uint ratePP; // artist's rate per pixel e.g. 50000000000
  uint public duration = 5 minutes; // contract time duration
  uint8 private commissionPct = 30;
  mapping (address => Commission[]) commissions;

  event CommissionCreated(address commission);

  function setArtist(address _artist, uint _ratePP) public onlyOwner {
    artist = _artist;
    ratePP = _ratePP;
  }

  function setCommissionPct(uint8 pct) public onlyOwner {
    require(pct <= 100);
    commissionPct = pct;
  }

  function getCommissionPct() public view onlyOwner returns(uint8) {
    return commissionPct;
  }

  function setContractDuration(uint _duration) public onlyOwner {
    duration = _duration;
  }
  
  function getQuote(uint16 width, uint16 height) public view returns(uint) {
    return width * height * ratePP; 
  }

  function commissionArt(uint16 width, uint16 height) public payable returns(address) {
    require(artist != 0);
    uint price = getQuote(width, height);
    uint cut = price * commissionPct / 100;
    Commission c = new Commission(artist, address(this), msg.sender, width, height, now + duration, price, cut);
    commissions[msg.sender].push(c);
    emit CommissionCreated(c);
    if (msg.value > 0) {
      c.fund.value(msg.value)();
    }
    return c;
  }

  function getMyCommissions() public view returns(Commission[]) {
    return getPatronCommissions(msg.sender);
  }

  function getPatronCommissions(address patron) public view returns(Commission[]) {
    return commissions[patron];
  }

  function() public payable {}

}