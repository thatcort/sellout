# Avoiding Common Attacks

## Exposure

Functions have the most restrictive access possible. They also have access guards so only certain addresses may access them.

## Timestamp Vulnerabilities

The only dependence on timestamps is the commission expiry, which allows a patron to get their money refunded after a set amount of time. The worst that can happen from a refunded commission is that the artist server spends time making a piece of art that cannot be seen. This is not a problem.

## Security

Ideally the location of the artwork would be encrypted with the patron's public key so only they could see it. Unfortunately, there does not yet seem to be a standard way to encrypt a message to an address. Hopefully one day EIP 1024 will be done and this will be possible: https://github.com/ethereum/EIPs/pull/1098

## Race Conditions

States are set first in contracts in order to avoid re-entrant attacks or race conditions.

## Integer Over/Underflow

The few mathematical operations in the app have been made safe by upcasting their operands from smaller sized uints (e.g. uint8) to full 256-bit uints before performing calculations.

## Denial of Service

The app uses the withdrawal design pattern for refunds. The following push transfers are used: 
Transfers to the agent contract are safe because they are part of the application.
Transfers to the artist address upon delivery of the art are safe because if they fail the transaction reverts and later the patron can get a refund.

