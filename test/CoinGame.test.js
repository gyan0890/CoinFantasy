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

default_params = {'_gameId':gameId, '_numberOfCoins': numberOfCoins, '_gameTime': gameTime, 
'_numberOfWinners':numberOfWinners, '_winnerWeight':winnerWeight, '_gamePool':gamePool, '_lockIn':lockIn, '_playerContribution':playerContribution, '_account':0, '_sendtoConstruct':sendtoConstruct};

function createNewContract(params = default_params){
    return Game.new(
        params['_gameId'],
        params['_numberOfCoins'],
        params['_gameTime'],
        params['_numberOfWinners'],
        params['_winnerWeight'],
        params['_gamePool'],
        params['_lockIn'],
        params['_playerContribution'],
        {from: params['_account'], value: params['_sendtoConstruct']}
    )
}

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}




describe('constructor', () => {
    var instance;
    
    before(async function(){
        accounts = await web3.eth.getAccounts();   
    });

    beforeEach(async()=>{
        params = default_params;
        params['_account']=accounts[0];
        instance = await createNewContract(params);
    });

    it("should have created an instance", function () {
        ;
    });


    it("should return the state of the contract", async function  () {
        await instance.getGameState.call(); 
    });

    it("should have contractBalance > 0 and <= " + sendtoConstruct.toString(), async function () {
        state = await instance.getGameState.call();
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
        params = default_params;
        params['_account']=accounts[0];
        instance = await createNewContract(params);

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

    it('should have upated the time', async function(){
        await timeout(3000);
        var curGameState = await instance.getGameState.sendTransaction();
        var curGameState = await instance.getGameState.call();
        assert(curGameState[11] < gameTime);
        console.log('\tTime left: ',curGameState[11].toString() + 's');
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
    params = default_params;
    params['_account']=accounts[0];
    instance = await createNewContract(params);

    initGameState = await instance.getGameState.call();

    weightage = [1, 1, 1];
    coinsSelected = [0, 1, 2];
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
  });
});


describe('endGame', () => {
    before(async function () {
        accounts = await web3.eth.getAccounts();


        params = default_params;
        params['_account']=accounts[0];
        params['_gameTime']=10;
        instance = await createNewContract(params);
    
        initGameState = await instance.getGameState.call();
    
        weightage = [1, 1, 1];
        coinsSelected = [0, 1, 2];
        await instance.joinGame.sendTransaction(coinsSelected, weightage, {from:accounts[1], value:playerContribution});
        await instance.joinGame.sendTransaction(coinsSelected, weightage, {from:accounts[2], value:playerContribution});
        await instance.joinGame.sendTransaction(coinsSelected, weightage, {from:accounts[3], value:playerContribution});
        await instance.startGame.sendTransaction();
    });
  
    it('should have created deployed a Game contract, 3 players have joined the game and the game should have started', async function () {
        ;
    });

    it('should throw error if the deadline is not reached', async function () {
        error = true;
        try{
            await instance.endGame.sendTransaction({from:accounts[0]});
            error = false;
        }catch(e){;}
        assert(error);
    });

    it('should throw error if someone other than organizer calls endGame', async function () {
        await timeout(10000);
        error= true;
        try{
            await instance.endGame.sendTransaction({from:accounts[1]});
            error = false;
        }catch(e){;}
        assert(error);
    }); 

    it('should end the game if the deadline is reached', async function(){
        await timeout(10000);
        await instance.endGame.sendTransaction({from:accounts[0]});
    });

    

});



describe('distributePrize', () => {
    before(async function () {
        accounts = await web3.eth.getAccounts();
        params = default_params;
        params['_account']=accounts[0];
        params['_gameTime']=3;
        instance = await createNewContract(params);
    
        initGameState = await instance.getGameState.call();
    
        weightage = [1, 1, 1];
        coinsSelected = [0, 1, 2];
        await instance.joinGame.sendTransaction(coinsSelected, weightage, {from:accounts[1], value:playerContribution});
        await instance.joinGame.sendTransaction(coinsSelected, weightage, {from:accounts[2], value:playerContribution});
        await instance.joinGame.sendTransaction(coinsSelected, weightage, {from:accounts[3], value:playerContribution});
        await instance.startGame.sendTransaction();
        await timeout(3000);
        await instance.endGame.sendTransaction({from:accounts[0]});
      
    });
  
    it('-created a game -3 players joined the game -game started -game ended', async function () {
        ;
    });


    it('should distribute prize if the deadline is reached', async function(){
        var balance = [await web3.eth.getBalance(accounts[1]), await web3.eth.getBalance(accounts[2]), await web3.eth.getBalance(accounts[3])];
        // console.log('balance: ', balance);
        await instance.distributePrize.sendTransaction([accounts[1], accounts[2], accounts[3]]);
        var balance2 = [await web3.eth.getBalance(accounts[1]), await web3.eth.getBalance(accounts[2]), await web3.eth.getBalance(accounts[3])];
        // console.log('balance2: ', balance2);
        assert(balance < balance2);
        
        
    });

    it('should throw error if someone other than organizer calls distributePrize()', async function () {
        await timeout(10000);
        error= true;
        try{
            await instance.distributePrize.sendTransaction([accounts[1], accounts[2], accounts[3]], {from:accounts[1]});
            error = false;
        }catch(e){;}
        assert(error);
    });

});
