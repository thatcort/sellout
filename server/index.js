const Web3 = require('web3');
const AgentABI = require('../build/contracts/Agent.json');
const CommissionABI = require('../build/contracts/Commission.json');
const contract = require('truffle-contract');

// const Canvas = require('canvas');
const { createCanvas } = require('canvas');
console.log('createCanvas: ' + createCanvas);
const IPFS = require('ipfs')
const bs58 = require('bs58')
var ipfs;

const fs = require('fs');

var web3;
var agentContract;
var commissionContract;

var queue = [];

var httpServer;

const artistPrivateKey= '0x07b5863d2cc574186b2d9f08227fe2e4b1948a854bdfb96d6559e0a59eb808a8';
var artistAccount;
var agent;

function init() {
  var provider = new Web3.providers.HttpProvider('http://127.0.0.1:8545')
  web3 = new Web3(provider);

  artistAccount = web3.eth.accounts.privateKeyToAccount(artistPrivateKey);
  console.log('artistAccount: ' + JSON.stringify(artistAccount));
  web3.eth.defaultAccount = artistAccount.address;

  console.log('AgentABI: ' + AgentABI);
  agentContract = createContract(AgentABI);
  // agentContract = contract(AgentABI);
  // agentContract.setProvider(provider);
  console.log('agentContract: ' + agentContract);

  // commissionContract = contract(CommissionABI);
  // commissionContract.setProvider(provider);
  // commissionContract = createContract(CommissionABI);

  ipfs = new IPFS();
  ipfs.on('ready', () => {
    console.log('IPFS ready');
    agentContract.deployed().then(instance => {
      console.log('Found deployed agent: ' + instance);
      agent = instance;
      console.log('agent: ' + agent);
      agent.CommissionCreated(
        // {fromBlock: 0, toBlock: 'latest'}
      ).watch((error, result) => {
        if (error) {
          console.log('Error listening for commissions:' + error);
          return;
        }
        const cAddress = result.args.commission;
        console.log('Found new commission: ' + cAddress);
        if (!commissionContract) {
          commissionContract = createContract(CommissionABI);
        }
        commissionContract.at(cAddress).then(c => {
          queue.push(c);
        });
      });
    });
  });

  startServer();

}

function startServer() {

  const timeout = setInterval(() => {
    while (queue.length) {
      const c = queue.shift();
      completeCommission(c);
    }
  }, 3000);
}

function completeCommission(commission) {
  console.log('Starting commission: ' + commission.address);
  let width, height;
  commission.width.call().then(w => {
    width = w.toNumber();
    console.log('Got width: ' + width);
    return commission.height.call();
  }).then(h => {
    height = h.toNumber();
    console.log('Got height: ' + height);
    return notifyStarting(commission);
  }).then(result => {
    console.log('Notified commision that starting work');
    return makeImage(width, height);
  }).then(buffer => {
    console.log('Created image: ' + buffer);
    return ipfs.files.add(buffer);
  }).then(result => {
    console.log('Added file to IPFS: ' + JSON.stringify(result));
    // convert ipfs hash to solidity bytes32 (https://digioli.co.uk/2018/03/08/converting-ipfs-hash-32-bytes/)
    const bytes = '0x' + bs58.decode(result[0].hash).slice(2).toString('hex');
    console.log('Saved image to IPFS: ' + result.hash + ' = ' + bytes);
    return notifyReady(commission, bytes);
  }).then(result => {
    console.log('Notified commission that work is ready');
    return web3.eth.getBalance(commission.address);
  }).then(result => {
    console.log('Artist balance: ' + result);
  }).catch(error => {
    console.log('Problem completing commission: ' + error);
  });



}

function makeImage(width, height) {
  console.log('Canvas: ' + width + ' x ' + height);
  // const canvas = new Canvas(width, height);
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  const random256 = () => Math.floor(Math.random() * 256);
  const hex2 = v => ('0' + v.toString(16)).slice(-2);
  const randomHex2 = () => hex2(random256());

  const numCircles = Math.round(Math.random(95)) + 5;
  for (let i=0; i < numCircles; i++) {
    const isGrey = Math.random() > 0.2;
    let color;
    if (isGrey) {
      const v = randomHex2();
      color = '#' + v + v + v;
    } else {
      color = '#' + randomHex2() + randomHex2() + randomHex2();
    }
    ctx.fillStyle = color;

    const radius = Math.random() * width * 0.5 + Math.max(width * 0.01, 1);
    const x = Math.random() * width;
    const y = Math.random() * height;
    // console.log('color: ' + color + ' x: ' + x + ' y: ' + y + ' r: ' + radius);
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  const fn = '/tmp/' + Date.now() + '.png';
  fs.writeFile(fn, canvas.toBuffer(), (err) => console.log(err || 'Wrote buffer to ' + fn));
  
  return Promise.resolve(canvas.pngStream());
}

/** Utility function to get truffle-contract to work with web3 v1 */
function createContract(abi) {
  console.log('Creating contract for ABI: ' + abi);
  const c = contract(abi);
  c.setProvider(web3.currentProvider);
  //dirty hack for web3@1.0.0 support for localhost testrpc, see https://github.com/trufflesuite/truffle-contract/issues/56#issuecomment-331084530
  if (typeof c.currentProvider.sendAsync !== "function") {
    c.currentProvider.sendAsync = function() {
      return c.currentProvider.send.apply(c.currentProvider, arguments);
    };
  }
  return c;
}

function notifyStarting(commission) {
  const payload = createPayload(commission, 'notifyStarting', []);
  return sendTransaction(commission, payload);
}

function notifyReady(commission, bytes) {
  const payload = createPayload(commission, 'notifyReady', [bytes])
  return sendTransaction(commission, payload);
}

function createPayload(commission, name, values) {
  const abi = commission.contract.abi.find(item => item.name === name);
  return web3.eth.abi.encodeFunctionCall(abi, values);
  // const sig =  name + '(' + (types ? types.join(',') : '') + ')';
  // return web3.eth.abi.encodeFunctionSignature(sig);
}

function sendTransaction(commission, payload) {
  console.log('Send transaction: ' + payload);
  const tx = {
    from: artistAccount.address,
    to: commission.address,
    data: payload,
    gas: 2000000
  };
  web3.eth.accounts.signTransaction(tx, artistPrivateKey).then(signed => {
    var tran = web3.eth.sendSignedTransaction(signed.rawTransaction);

    tran.on('confirmation', (confirmationNumber, receipt) => {
      console.log('confirmation: ' + confirmationNumber);
    });

    tran.on('transactionHash', hash => {
      console.log('hash');
      console.log(hash);
    });

    tran.on('receipt', receipt => {
      console.log('reciept');
      console.log(receipt);
    });

    tran.on('error', console.error);
  })
}

init();
