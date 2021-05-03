const CoinGame = artifacts.require("Game");
const USDC = artifacts.require("USDC_coin");

/*from secrets.json*/
//var {account} = require('../secrets.json');


/*ganache network*/
// const Web3 = require('web3');
// web3= new Web3(new Web3.providers.HttpProvider('http://localhost:7545'));

/*metamask or infura*/
const web3 = require('../web3');


// var accounts;

let token = '0x68ec573C119826db2eaEA1Efbfc2970cDaC869c4'
var usdc_contract

module.exports = async function (deployer) {
  // await deployer.deploy(USDC).then((contract)=>{
  //   // console.log(contract);
  //   usdc_contract=contract
  // });
  // console.log(temp);
  // token = await usdc_contract.address;
  // const accounts = await web3.eth.getAccounts();
  const accounts = ['0x604BCD042D2d5B355ecE14B6aC3224d23F29a51c'];
  const acc = accounts[0];
    console.log('deploying contract from account:', acc);
    await deployer.deploy(
      CoinGame, 
      token,                            
      {from:accounts[0]}
    );
  };

  //0, 3, 10, 1, 1, [550], 1000, 1, 1000, 0x68ec573C119826db2eaEA1Efbfc2970cDaC869c4