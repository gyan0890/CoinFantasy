const CoinGame = artifacts.require("Game");

/*from secrets.json*/
//var {account} = require('../secrets.json');


/*ganache network*/
// const Web3 = require('web3');
// web3= new Web3(new Web3.providers.HttpProvider('http://localhost:7545'));

/*metamask or infura*/
const web3 = require('../web3');


// var accounts;

module.exports = async function (deployer) {
  const accounts = await web3.eth.getAccounts();
  const acc = accounts[0];
    console.log('deploying contract from account:', acc);
    await deployer.deploy(
      CoinGame, 
      0,//game id
      7,//number of coins
      14400,//game time
      3,//number of winners
      [450, 250, 100],
      1000, //game pool
      10, //lock_in percentage
      200,//player contribution,
      {from: acc, value: 100000}
    );
  };