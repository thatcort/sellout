var SimpleStorage = artifacts.require("./SimpleStorage.sol");
// var Util = artifacts.require("./Util.sol");
var strings = artifacts.require("./libraries/strings.sol");
var LinkedAddressList = artifacts.require("./LinkedAddressList.sol");
var Artist = artifacts.require("./Artist.sol");
var Agent = artifacts.require("./Agent.sol");
var Commission = artifacts.require("./Commission.sol");

module.exports = function(deployer, network, accounts) {

  const owner = accounts[0];

  deployer.deploy(LinkedAddressList);
  deployer.link(LinkedAddressList, Artist);
  deployer.deploy(Artist, {from: owner, gas: 1000000});
  deployer.deploy(Agent);
  deployer.then(async () => {
    const artist = await Artist.deployed();
    const agent = await Agent.deployed();
    await agent.setArtist(artist.address, 5000000000000, {from: owner});
  });


  // deployer.deploy(SimpleStorage);
  deployer.deploy(strings);
  // deployer.deploy(Commission);
};
