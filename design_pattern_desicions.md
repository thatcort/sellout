# Design Patterns

The following design patterns are used in the system:

## Fail Early, Fail Loud

Modifiers are used to check contract state at the start of method execution and revert transactions if the state is invalid.

## Restricting Access

The `AccessRestriction` contract provides mechanisms to control access to methods for specific addresses. The `Owned` contract further restricts this to only the creator of the contract.

## Mortal

The `Mortal` contract provides self-destruct functionality that can only be invoked by the owner (creator) of the contract.

## Pull Over Push Payments

If a commission expires without an artwork being created, the patron my request a refund.

## State Machine

The commission contract is a state machine. Commissions states are `CREATED, FUNDED, STARTED, READY, REFUNDED`. Based on the state of the commission different functionality is possible.

