const assert = require("assert");
const Game = artifacts.require("Game");

const Web3 = require('web3');
web3= new Web3(new Web3.providers.HttpProvider('http://localhost:7545'));

var accounts;



const sendtoConstruct = 100000;
const playerContribution = 200000;
const numberOfCoins = 3;
const gameTime = 4*3600;
const numberOfWinners = 3;
const gamePool = 100000;
const lockIn = 10;
const gameId = 1;
const winnerWeight = [45000, 250000, 10000];

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
            winnerWeight,//winnerWeight
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
        var error = false;
        try{
            const instance2 = instance = await Game.new(1, 7, 4*3600, 3, [45000, 250000, 10000],  100000, 10, 200000,  {from: accounts[0], value: 0});
            console.log('no error, but error expected!')
        }catch(e){
            error = true;
        }
        assert(error);
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
            winnerWeight,//winner weight
            gamePool, //game pool
            lockIn, //lock_in percentage
            playerContribution, //player contribution,
            {from: accounts[0], value: sendtoConstruct}
        );

        initGameState = await instance.getGameState.call();

        await instance.joinGame.sendTransaction(coinsSelected, weightage, {from:accounts[3], value:playerContribution});

        //call will not modify the state of the contract
        instance.joinGame.call(coinsSelected, weightage, {from:accounts[3], value:playerContribution}).then(function(gameId){gameIdReturned = gameId});
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


describe('startGame', () => {
  before(async function () {
    accounts = await web3.eth.getAccounts();
    instance = await Game.new(
        1,//game id
        numberOfCoins,//number of coins
        gameTime,//game time
        numberOfWinners,//number of winners
        winnerWeight,//winner weight
        gamePool, //game pool
        lockIn, //lock_in percentage
        playerContribution, //player contribution,
        {from: accounts[0], value: sendtoConstruct}
    );

    initGameState = await instance.getGameState.call();

    weightage = [1, 1, 1];
    coinsSelected = [0, 1, 2];
    // instance.joinGame.sendTransaction(coinsSelected, weightage, {from:accounts[3], value:playerContribution});
    await instance.joinGame.sendTransaction(coinsSelected, weightage, {from:accounts[1], value:playerContribution}).then(()=>{console.log('\tplayer 1 joined the game!')});
    await instance.joinGame.sendTransaction(coinsSelected, weightage, {from:accounts[2], value:playerContribution}).then(()=>{console.log('\tplayer 2 joined the game!')});
    await instance.joinGame.sendTransaction(coinsSelected, weightage, {from:accounts[3], value:playerContribution}).then(()=>{console.log('\tplayer 3 joined the game!')});
  });

  it('should have created deployed a Game contract and 3 players have joined the game', async function () {
      ;
  })

  it('should start the game', async function () {
    await instance.startGame.sendTransaction({from:accounts[0]});
  });

  it('should throw error if someone other than organizer calls startGame', async function () {
      error= true;
      try{
          await instance.startGame.sendTransaction({from:accounts[1]});
          error = false;
      }catch(e){;}
      assert(error);
  })
});

describe('endGame', () => {
    before(async function () {
      accounts = await web3.eth.getAccounts();
      instance = await Game.new(
          1,//game id
          numberOfCoins,//number of coins
          gameTime,//game time
          numberOfWinners,//number of winners
          winnerWeight,//winner weight
          gamePool, //game pool
          lockIn, //lock_in percentage
          playerContribution, //player contribution,
          {from: accounts[0], value: sendtoConstruct}
      );
  
      initGameState = await instance.getGameState.call();
  
      weightage = [1, 1, 1];
      coinsSelected = [0, 1, 2];
      // instance.joinGame.sendTransaction(coinsSelected, weightage, {from:accounts[3], value:playerContribution});
      await instance.joinGame.sendTransaction(coinsSelected, weightage, {from:accounts[1], value:playerContribution}).then(()=>{console.log('\tplayer 1 joined the game!')});
      await instance.joinGame.sendTransaction(coinsSelected, weightage, {from:accounts[2], value:playerContribution}).then(()=>{console.log('\tplayer 2 joined the game!')});
      await instance.joinGame.sendTransaction(coinsSelected, weightage, {from:accounts[3], value:playerContribution}).then(()=>{console.log('\tplayer 3 joined the game!')});
      await instance.startGame.sendTransaction();
    });
  
    it('should have created deployed a Game contract, 3 players have joined the game and the game should have started', async function () {
        ;
    });
  })


