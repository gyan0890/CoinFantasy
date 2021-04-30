const CoinGame = artifacts.require("Game");
const USDC = artifacts.require("USDC_coin");
/*from secrets.json*/
//var {account} = require('../secrets.json');


/*ganache network*/
const Web3 = require('web3');
web3= new Web3(new Web3.providers.HttpProvider('http://localhost:7545'));

/*metamask or infura*/
// const web3 = require('../web3');


// var accounts;

// let token = '0x68ec573C119826db2eaEA1Efbfc2970cDaC869c4'

module.exports = async function (deployer) {
  const accounts = await web3.eth.getAccounts();
  const acc = accounts[0];
  console.log('deploying contract from account:', acc);
  let usdc_contract = await deployer.deploy(USDC);

  await deployer.deploy(
    CoinGame, 
    usdc_contract.address,                           
    {from:accounts[0]}
  );
};

  //0, 3, 10, 1, 1, [550], 1000, 1, 1000, 0x68ec573C119826db2eaEA1Efbfc2970cDaC869c4