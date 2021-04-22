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
      0,//game id                                     -0
      7,//number of coins                             -1
      10,//game time                                  -2
      1,//                                            -3
      1,//number of winners                           -4
      [550],//                                        -5
      1000, //game pool                               -6
      10, //lock_in percentage                        -7
      1000,//player contribution,                     -8
      '0x07865c6e87b9f70255377e024ace6630c1eaa37f',// -9
      {from: acc, value: 100000}
    );
  };