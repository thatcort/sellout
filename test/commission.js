const Commission = artifacts.require("./Commission.sol");
const exceptions = require('./exceptions.js');
const catchRevert = exceptions.catchRevert;
const BN = require('bn.js');

contract('Commission Lifecycle', async (accounts) => {

  const patron = accounts[0];
  const agent = accounts[1];
  const artist = accounts[2];
  const width = 234;
  const height = 123;
  const price = 1000000;
  const agentCut = price * 0.3;
  const location = '0x1234567890123456789012345678901234567890123456789012345678901234';

  const expiryTime = (durationInSeconds) => (Date.now() / 1000) + durationInSeconds;

  let instance = null

  beforeEach('setup Commission contract for each test', async() => {
    instance = await Commission.new(artist, agent, patron, width, height, expiryTime(10), price, agentCut);
  });

  assertEventExists = (result, evt) => assert.isNotEmpty(result.logs.filter(item => item.event === evt));

  it('Should be able to be funded', async () => {
    const result = await instance.fund({from: patron, value: price});
    const bal = await web3.eth.getBalance(instance.address);
    assert.equal(bal, price);
    assertEventExists(result, 'Funded');
  });

  it('Should not be immediately refundable', async () => {
    await catchRevert(instance.refund({from: patron}));
  });

  it('Should only be fulfilled by the artist', async () => {
    await instance.fund({from: patron, value: price});
    await catchRevert(instance.notifyStarting({from: patron}));
  });

  it('Should be fulfillable by the artist', async () => {
    await instance.fund({from: patron, value: price});
    const starting = await instance.notifyStarting({from: artist});
    assertEventExists(starting, 'Started');
    const ready = await instance.notifyReady(location, {from: artist});
    assertEventExists(ready, 'Ready');
    const loc = await instance.getArtLocation.call({from: patron});
    assert.equal(loc, location);
  });

  it('Should pay out after being completed', async () => {
    await instance.fund({from: patron, value: price});
    await instance.notifyStarting({from: artist});
    await instance.notifyReady(location, {from: artist});
    // const artistPaid = await instance.payArtist({from: artist});
    // const agentPaid = await instance.payAgent({from: agent});
    const instanceBal = await web3.eth.getBalance(instance.address);
    assert.equal(instanceBal.toString(), '' + 0);
  });

  it('Should not be fundable after it expires', async function() {
    instance = await Commission.new(artist, agent, patron, width, height, expiryTime(0), price, agentCut);
    await catchRevert(instance.fund({from: patron, value: price}));
  });

  it('Should not be refundable before it expires', async function() {
    instance = await Commission.new(artist, agent, patron, width, height, expiryTime(9), price, agentCut);
    const fundResult = await instance.fund({from: patron, value: price});
    await catchRevert(instance.refund({from: patron}));
  })

  it('Should be refundable after it expires', async function() {
    instance = await Commission.new(artist, agent, patron, width, height, expiryTime(1), 1e18, agentCut);
    const fundResult = await instance.fund({from: patron, value: 1e18});
    const beforeBal = await web3.eth.getBalance(patron);
    this.timeout(4000);

    const afterExpiryTasks = async () => {
      const result = await instance.refund({from: patron});
      assertEventExists(result, 'Refunded');
      assert.equal(await web3.eth.getBalance(instance.address), 0, 'Contract balance should be 0 after refund');
      const afterBal = await web3.eth.getBalance(patron);
      assert.isAbove(afterBal.toNumber(), beforeBal.toNumber(), 'Patron should greater blance after refund: ' + beforeBal + ' --> ' + afterBal);
      try {
          await instance.refund({from: patron});
          throw null;
      }
      catch (error) {
          assert(error, "Should only be refundable once. Expected an error but did not get one");
      }
    };
    const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
    return wait(2500).then(afterExpiryTasks);
  }); 

});
