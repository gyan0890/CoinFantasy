const assert = require("assert");
const Game = artifacts.require("Game");

const Web3 = require('web3');
web3= new Web3(new Web3.providers.HttpProvider('http://localhost:7545'));

var accounts;



const sendtoConstruct = 100000;
const playerContribution = 200000;
const numberOfCoins = 7;
const gameTime = 4*3600;
const numberOfWinners = 3;
const gamePool = 100000;
const lockIn = 10;
const gameId = 1;

describe('constructor', () => {
    var instance;
    
    before(async function(){
        accounts = await web3.eth.getAccounts();   
    });

    beforeEach(async()=>{
        instance = await Game.new(
            gameId,//game id
            numberOfCoins,//number of coins
            gameTime,//game time
            numberOfWinners,//number of winners
            gamePool, //game pool
            lockIn, //lock_in percentage
            playerContribution, //player contribution,
            {from: accounts[0], value: sendtoConstruct}
        );
    });

    it("should have created an instance", function () {
        ;
    });


    it("should return the state of the contract", async function  () {
       var state = await instance.getGameState.call(); 
    //    console.log('state of the contract: ', state);
    });

    it("should have contractBalance > 0 and <= " + sendtoConstruct.toString(), async function () {
        var state = await instance.getGameState.call();
        assert(state[5] > 0 && state[5] <= sendtoConstruct); 
    });

    it("should return error if insufficient amount is sent by the game owner", async function(){
        try{
            const instance2 = instance = await Game.new(1, 7, 4*3600, 3, 100000, 0, 200000,  {from: accounts[0], value: 0});
            assert(false);
        }catch(e){
            ;
        }

    });

});


describe('joinGame', () => {
    var instance;
    var coinsSelected = [0, 5, 3, 2, 6, 9, 11];
    var weightage = [1, 1, 1, 1, 1, 1, 1];
    var initGameState;
    var gameIdReturned;

    before(async function () {
        accounts = await web3.eth.getAccounts();
        instance = await Game.new(
            1,//game id
            numberOfCoins,//number of coins
            gameTime,//game time
            numberOfWinners,//number of winners
            gamePool, //game pool
            lockIn, //lock_in percentage
            playerContribution, //player contribution,
            {from: accounts[0], value: sendtoConstruct}
        );

        initGameState = await instance.getGameState.call();

        await instance.joinGame.sendTransaction(coinsSelected, weightage, {from:accounts[3], value:playerContribution});

        //call will not modify the state of the contract
        gameIdReturned = await instance.joinGame.call(coinsSelected, weightage, {from:accounts[3], value:playerContribution});
    });

    beforeEach(async function(){
        coinsSelected = [0, 5, 3, 2, 6, 9, 11];
        weightage = [1, 1, 1, 1, 1, 1, 1];
    });


    it('should have created an instance and player 1 should have joined the game', async function(){
        ;
    });

    it('should have upated the contractBalance', async function(){
        var curGameState = await instance.getGameState.call();
        assert(curGameState[5] > initGameState[5]);
    });

    it('should return error if # of coins selected are less than'+numberOfCoins.toString(), async function(){
        coinsSelected = [1, 2];
        weightage = [1, 1];
        var error = false;
        try{
            await instance.joinGame.sendTransaction(coinsSelected, weightage, {from:accounts[3], value:playerContribution});
        }catch(e){
            error=true;
        }
        assert(error);
    });

    it('should return proper game id', async function(){
        assert(gameId == gameIdReturned);
    });

});

