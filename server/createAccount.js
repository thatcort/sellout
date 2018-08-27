var Web3 = require('web3');

var provider = new Web3.providers.HttpProvider('http://127.0.0.1:8545')
var web3 = new Web3(provider);

var account = web3.eth.accounts.create();
console.log(account);