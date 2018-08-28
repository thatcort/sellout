pragma solidity ^0.4.24;

import './Util.sol';
import './LinkedAddressList.sol';
import './Commission.sol';

/** 
 * Library Demo
 * 
 * Originally the app was going to use a contract for the Artist.
 * I wrote a dequeue (LinkedAddressList) library to use. This contract demonstrates its use.
 * The library has unit tests that demonstrate it's use. See tests/TestLinkedAddressList.sol.
 */
contract Artist is Mortal {

  using LinkedAddressList for LinkedAddressList.List;

  LinkedAddressList.List backlog;
  LinkedAddressList.List completed;

  event Commissioned(Commission commission);

  function nextJob() internal constant returns(Commission) {
    return Commission(backlog.getHeadData());
  }

  function commission(Commission c) public {
    backlog.addLast(c);
    emit Commissioned(c);
  }
  



}