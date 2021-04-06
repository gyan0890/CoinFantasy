const CoinGame = artifacts.require("Game");
const Web3 = require('web3');
web3= new Web3(new Web3.providers.HttpProvider('http://localhost:7545'));
const fs = require('fs');

var accounts;


module.exports = async function (deployer) {
    accounts = await web3.eth.getAccounts();
    deployer.deploy(
      CoinGame, 
      0,//game id
      7,//number of coins
      4*3600,//game time
      3,//number of winners
      [45000, 250000, 10000],
      100000, //game pool
      10, //lock_in percentage
      200000,//player contribution,
      {from: accounts[0], value: 100000}
    )
  };