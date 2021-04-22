const assert = require("assert");
const Game = artifacts.require("Game");
const ERC20 = artifacts.require("ERC20");



const sendtoConstruct = 100000;
const playerContribution = 1000;
const numberOfCoins = 3;
const gameTime = 10;
const numPlayers = 1;
const numberOfWinners = 1;
const gamePool = 1000;
const lockIn = 10;
const gameId = 1;
const winnerWeight = [550];

var usdc, accounts, default_params;

accounts = ['0x604BCD042D2d5B355ecE14B6aC3224d23F29a51c'];

default_params = {'_gameId':gameId, '_numberOfCoins': numberOfCoins, '_gameTime': gameTime, '_numPlayers': numPlayers,
'_numberOfWinners':numberOfWinners, '_winnerWeight':winnerWeight, '_gamePool':gamePool, 
'_lockIn':lockIn, '_playerContribution':playerContribution, '_account':accounts[0], '_sendtoConstruct':sendtoConstruct,
'_token':'0x68ec573c119826db2eaea1efbfc2970cdac869c4'};


describe('usdc_contract', async  ()=> {
    it('access the deployed usdc contract', async ()=>{
    usdc = await ERC20.at(default_params['_token']);
    console.log('account[0] balance: ', (await usdc.balanceOf.call(accounts[0])).toString());
    });
});





function createNewContract(params = default_params){
    return Game.new(
        params['_gameId'],
        params['_numberOfCoins'],
        params['_gameTime'],
        params['_numPlayers'],
        params['_numberOfWinners'],
        params['_winnerWeight'],
        params['_gamePool'],
        params['_lockIn'],
        params['_playerContribution'],
        params['_token'],
        {from: params['_account'], value: params['_sendtoConstruct']}
    )
}

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


var instance;
describe('Game', async function () {
    var coinsSelected = [0, 5, 3];
    var weightage = [1, 1, 1];
    var initBalance = [];
    params = default_params;

    it('should create an instance of the contract', async function () {
        instance = await createNewContract(params);
    })

    it('player 1 should have joined', async function () {

        await usdc.approve.sendTransaction(instance.address, playerContribution*10, {from:accounts[0]});
        await instance.joinGame.sendTransaction(coinsSelected, weightage, playerContribution, {from:accounts[0]});
    });
    it('starts the game', async function () {
        await instance.startGame.sendTransaction({from:accounts[0]});
    });
  

    it('ends game', async function () {
        await timeout(10);
        await instance.endGame.sendTransaction({from:accounts[0]});
    });


    it('should distribute prize', async function () {
        initBalance = [await usdc.balanceOf.call(accounts[0])];
        await instance.distributePrize.sendTransaction([accounts[0]], {from:accounts[0]});
    });


    it('should have sent back the tokens', async function () {
        let currentBalance = [await usdc.balanceOf.call(accounts[0])];
        assert(currentBalance[0] > initBalance[0]);
    });

});
