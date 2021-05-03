const assert = require("assert");
const Game = require("../build/contracts/Game.json");
const ERC20 = require("../build/contracts/ERC20.json");
const web3 = require('../web3');
const { reject } = require("any-promise");



const sendtoConstruct = 100000;
const playerContribution = 1000;
const numberOfCoins = 3;
const gameTime = 10;
const numPlayers = 1;
const numberOfWinners = 1;
const gamePool = 1000;
const lockIn = 1000;
const gameId = 1;
const winnerWeight = [550];
const token = '0x68ec573C119826db2eaEA1Efbfc2970cDaC869c4';

var usdc, accounts=[], default_params;

default_params = {'_gameId':gameId, '_numberOfCoins': numberOfCoins, '_gameTime': gameTime, '_numPlayers': numPlayers,
        '_numberOfWinners':numberOfWinners, '_winnerWeight':winnerWeight, '_gamePool':gamePool, 
        '_lockIn':lockIn, '_playerContribution':playerContribution, '_account':accounts[0], '_sendtoConstruct':sendtoConstruct,
        '_token': token};

describe('usdc_contract', async  ()=> {

    it('access the deployed usdc contract', async ()=>{
    usdc = await new web3.eth.Contract(ERC20.abi, token);
    accounts = await web3.eth.getAccounts();
    console.log('\taccount[0] balance: ', (await usdc.methods.balanceOf(accounts[0]).call()).toString());
    }).timeout(60000);
});


function timeOut(s) {
    return new Promise(resolve => setTimeout(resolve, s*1e3));
}




async function createNewContract(params = default_params){
    return new Promise( async function (resolve, reject){
        const contract = await new web3.eth.Contract(Game.abi);
        const deployedContract = await contract.deploy({
            data: Game.bytecode,
            arguments:[
            
            params['_token'],
            ]               
        }).send({from: params['_account']});
        await usdc.methods.approve(deployedContract.options.address, params['_lockIn']).send({from:accounts[0]});
        await deployedContract.methods.pseudoConstructor(
            params['_gameId'],//                -0
            params['_numberOfCoins'],//         -1      
            params['_gameTime'],//              -2
            params['_waitTime'],//              -3
            params['_numPlayers'],//            -4
            params['_numberOfWinners'],//       -5
            params['_winnerWeight'],//          -6
            params['_gamePool'],//              -7      
            params['_lockIn'],//                -8
            params['_playerContribution'],//    -9
        ).send({from:accounts[0]});
        return resolve(deployedContract);
    });
}



var instance;
describe('Game', async function () {
    var coinsSelected = [0, 5, 3];
    var weightage = [1, 1, 1];
    var initBalance = [];
    default_params._account = accounts[0];
    params = default_params;



    it('should create an instance of the contract', async function () {
        accounts = await web3.eth.getAccounts();
        params['_account']=accounts[0];
        instance = await createNewContract(params);
        console.log('\tcontract address : ', instance.options.address);
    }).timeout(300000);



    it('player 1 should have joined', async function () {
        console.log('\t account balance(before): ', await usdc.methods.balanceOf(accounts[0]).call());
        console.log('\t contract balance(before): ', await usdc.methods.balanceOf(instance.options.address).call());
        await usdc.methods.approve(instance.options.address, playerContribution*10).send({from:accounts[0]});
        await instance.methods.joinGame(coinsSelected, weightage, playerContribution).send({from:accounts[0]});
        console.log('\t contract balance(after): ', await usdc.methods.balanceOf(instance.options.address).call());
        console.log('\t account balance(after): ', await usdc.methods.balanceOf(accounts[0]).call());
    }).timeout(300000);



    it('starts the game', async function () {
        await instance.methods.startGame().send({from:accounts[0]}).then((res, err) =>{
            if(err){
                console.log(res);
            }
        });
    }).timeout(300000);
  

    it('ends game', async function () {
        await timeOut(10);
        await instance.methods.endGame().send({from:accounts[0]}).then((res, err)=>{
            console.log(res);
        });
    }).timeout(300000);


    it('should distribute prize', async function () {
        initBalance = [await usdc.methods.balanceOf(accounts[0]).call()];
        await instance.methods.distributePrize([accounts[0]]).send({from:accounts[0]}).then((res, err)=>{
            console.log(res);
        });
    }).timeout(300000);


    it('should have sent back the tokens', async function () {
        let currentBalance = [await usdc.methods.balanceOf(accounts[0]).call()];
        assert(currentBalance[0] > initBalance[0]);
    }).timeout(300000);
});

describe('ExpiresGame', async function () {
    default_params._account = accounts[0];
    params = default_params;


    it('should create an instance of the contract', async function () {
        accounts = await web3.eth.getAccounts();
        params['_account']=accounts[0];
        instance = await createNewContract(params);
        console.log('\tcontract address : ', instance.options.address);
    }).timeout(300000);
  

    it('expires game', async function () {
        await timeOut(12);
        await instance.methods.expiredGame().send({from:accounts[0]}).then((res, err)=>{
            console.log(res);
        });
    }).timeout(300000);
});
