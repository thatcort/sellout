const Agent = artifacts.require("./Agent.sol");
const exceptions = require('./exceptions.js');
const catchRevert = exceptions.catchRevert;
const BN = require('bn.js');

contract('Agent Tests', async (accounts) => {

  const patron = accounts[0];
  const artist = accounts[1];
  const owner = accounts[2];

  let instance = null

  assertEventExists = (result, evt) => assert.isNotEmpty(result.logs.filter(item => item.event === evt));

  beforeEach('setup Commission contract for each test', async() => {
    instance = await Agent.new({from: owner});
    await instance.setArtist(artist, 50000000000, {from: owner});
  });

  it('Should cost more when the artist rate is higher', async () => {
    await instance.setCommissionPct(30, {from: owner});
    const quote1 = await instance.getQuote.call(100, 100, {from: patron});
    assert.isTrue(quote1.toNumber() >= 0, 'Quote is positive value');
    await instance.setArtist(artist, 60000000000, {from: owner});
    const quote2 = await instance.getQuote.call(100, 100, {from: patron});
    assert.isAbove(quote2.toNumber(), quote1.toNumber(), quote2 + ' > ' + quote1);
  });

  it('Should charge more for larger work', async () => {
    const quote1 = await instance.getQuote.call(100, 100, {from: patron});
    const quote2 = await instance.getQuote.call(101, 101, {from: patron});
    assert.isAbove(quote2.toNumber(), quote1.toNumber(), quote2 + ' > ' + quote1);
  });

  it('Should create commissions', async () => {
    const result = await instance.commissionArt(100, 100, {from: patron});
    const logs = result.logs.filter(item => item.event === 'CommissionCreated');
    // console.log(JSON.stringify(logs));
    assert.equal(logs.length, 1, 'One commission entry should exist');
    assert.exists(logs[0].args.commission, 'One commission address should exist');
  });

  it('Should keep track of each commissions for each patron', async () => {
    const r1 = await instance.commissionArt(100, 100, {from: patron});
    const r2 = await instance.commissionArt(100, 100, {from: patron});
    const r3 = await instance.getMyCommissions.call({from: patron});
    const r4 = await instance.getPatronCommissions.call(patron);
    assert.isArray(r3, 'My commissions should be an array');
    assert.isArray(r4, 'Patron\'s commissions should be an array');
    assert.isTrue(r3.length === 2 && r4.length === 2, 'Both results should be arrays of length 2. Found ' + r3.length + ' && ' + r4.length);
    assert.isTrue(!!r3[0] && !!r3[1] && !!r4[0] && !!r4[1], 'All commissions should be non-null');
  });

});