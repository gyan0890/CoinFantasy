const CoinGame = artifacts.require("Game");
const USDC = artifacts.require("USDC_coin");
const fs = require('fs');

/*from secrets.json*/
//var {account} = require('../secrets.json');


/*ganache network*/
// const Web3 = require('web3');
// web3= new Web3(new Web3.providers.HttpProvider('http://localhost:7545'));
const web3 = require('../web3');

/*metamask or infura*/
// const web3 = require('../web3');
//var account = web3.eth.getAccounts().then((accounts)=>{return accounts[0]});


// var accounts;

module.exports = async function (deployer) {
  const accounts = await web3.eth.getAccounts();
  const acc = accounts[0];
    console.log('deploying contract from account:', acc);
    let usdc_contract = await deployer.deploy(USDC);
    await deployer.deploy(
      CoinGame, 
      0,//game id
      7,//number of coins
      14400,//game time
      3,//number of winners
      [45000, 250000, 10000],
      100000, //game pool
      10, //lock_in percentage
      200000,//player contribution,
      usdc_contract.address,
      accounts[0],
      {from: acc, value: 100000}
    );
  };