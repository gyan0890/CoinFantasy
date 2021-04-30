const assert = require("assert");
const Game = artifacts.require("Game");
const USDC = artifacts.require("USDC_coin");

const web3 = require('../web3');



//cost
const sendtoConstruct = 100000;
const playerContribution = 2000;
const numberOfCoins = 3;
const gameTime = 4*3600;
const waitTime = 20;
const numberOfWinners = 3;
const gamePool = 1000;
const lockIn = 10;
const gameId = 1;
const winnerWeight = [450, 250, 100];

var usdc, accounts, default_params;

before(async function() {
    usdc = await USDC.new();
    accounts = await web3.eth.getAccounts();
    usdc_pool = await usdc.balanceOf(accounts[0]);

    for(let i = 1; i < 10; i++){
        await usdc.transfer.sendTransaction(accounts[i], usdc_pool/1e10, {from:accounts[0]});
    }

    default_params = {'_gameId':gameId, '_numberOfCoins': numberOfCoins, '_gameTime': gameTime,
    '_waitTime': waitTime, '_numberOfWinners':numberOfWinners, '_winnerWeight':winnerWeight, '_gamePool':gamePool, 
    '_lockIn':lockIn, '_playerContribution':playerContribution, '_account':0, '_sendtoConstruct':sendtoConstruct, 
    '_token':usdc.address, '_orgAddress':accounts[0]};

    return;
});


describe('usdc_contract', async  ()=> {
    it('access the deployed usdc contract', async ()=>{
    await usdc.balanceOf.call(accounts[0]);
    });
});






async function createNewContract(params = default_params){
    console.log(params);
    return new Promise( async function (resolve, reject){
        console.log(usdc.address);
        const deployedContract = await Game.new(usdc.address);
        console.log('created game instance');
        await usdc.approve.sendTransaction(deployedContract.address, params['_lockIn'], {from:accounts[0]});
        console.log('approved transaction');
        await deployedContract.pseudoConstructor.sendTransaction(
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
            {from:accounts[0]}
        );
        console.log('pseudoContructor returned');
        return resolve(deployedContract);
    });
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
            await Game.new(1, 7, 4*3600, 3, [450, 250000, 10000],  100000, 10, 200000,  {from: accounts[0], value: 0});
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
    var usdcBalance;
    var gameIdReturned;

    before(async function () {
        accounts = await web3.eth.getAccounts();
        params = default_params;
        params['_account']=accounts[0];
        instance = await createNewContract(params);

        initGameState = await instance.getGameState.call();
        initUsdcBalance = await usdc.balanceOf.call(instance.address);
        await usdc.approve.sendTransaction(instance.address, playerContribution * 1e1, {from:accounts[3]});
        
        await instance.joinGame.sendTransaction(coinsSelected, weightage, playerContribution, {from:accounts[3]});

        //call will not modify the state of the contract
        instance.joinGame.call(coinsSelected, weightage, playerContribution, {from:accounts[3]}).then(function(gameId){gameIdReturned = gameId});
    });

    beforeEach(async function(){
        coinsSelected = [0, 5, 3, 2, 6, 9, 11];
        weightage = [1, 1, 1, 1, 1, 1, 1];
    });


    it('should have created an instance and player 1 should have joined the game', async function(){
        ;
    });

    it('should have upated the contract usdc balance', async function(){
        var curUsdcBalance = await usdc.balanceOf.call(instance.address);
        assert(curUsdcBalance > initUsdcBalance);
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
            await instance.joinGame.sendTransaction(coinsSelected, weightage, playerContribution, {from:accounts[3]});
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
    await usdc.approve.sendTransaction(instance.address, playerContribution * 1e1, {from:accounts[1]});
    await usdc.approve.sendTransaction(instance.address, playerContribution * 1e1, {from:accounts[2]});
    await usdc.approve.sendTransaction(instance.address, playerContribution * 1e1, {from:accounts[3]});
    await instance.joinGame.sendTransaction(coinsSelected, weightage, playerContribution, {from:accounts[1]}).then(()=>{console.log('\tplayer 1 joined the game!')});
    await instance.joinGame.sendTransaction(coinsSelected, weightage, playerContribution, {from:accounts[2]}).then(()=>{console.log('\tplayer 2 joined the game!')});
    await instance.joinGame.sendTransaction(coinsSelected, weightage, playerContribution, {from:accounts[3]}).then(()=>{console.log('\tplayer 3 joined the game!')});
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
        await usdc.approve.sendTransaction(instance.address, playerContribution * 1e1, {from:accounts[1]});
        await usdc.approve.sendTransaction(instance.address, playerContribution * 1e1, {from:accounts[2]});
        await usdc.approve.sendTransaction(instance.address, playerContribution * 1e1, {from:accounts[3]});

        await instance.joinGame.sendTransaction(coinsSelected, weightage, playerContribution, {from:accounts[1]});
        await instance.joinGame.sendTransaction(coinsSelected, weightage, playerContribution, {from:accounts[2]});
        await instance.joinGame.sendTransaction(coinsSelected, weightage, playerContribution, {from:accounts[3]});
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

        await usdc.approve.sendTransaction(instance.address, playerContribution * 1e1, {from:accounts[1]});
        await usdc.approve.sendTransaction(instance.address, playerContribution * 1e1, {from:accounts[2]});
        await usdc.approve.sendTransaction(instance.address, playerContribution * 1e1, {from:accounts[3]});


        await instance.joinGame.sendTransaction(coinsSelected, weightage, playerContribution, {from:accounts[1]});
        await instance.joinGame.sendTransaction(coinsSelected, weightage, playerContribution, {from:accounts[2]});
        await instance.joinGame.sendTransaction(coinsSelected, weightage, playerContribution, {from:accounts[3]});
        await instance.startGame.sendTransaction();
        await timeout(3000);
        await instance.endGame.sendTransaction({from:accounts[0]});
      
    });
  
    it('-created a game -3 players joined the game -game started -game ended', async function () {
        ;
    });


    it('should distribute prize if the deadline is reached', async function(){
        var balance = [await usdc.balanceOf.call(accounts[1]), await usdc.balanceOf.call(accounts[2]), await usdc.balanceOf.call(accounts[3])];
        await instance.distributePrize.sendTransaction([accounts[1], accounts[2], accounts[3]]);
        var balance2 = [await usdc.balanceOf.call(accounts[1]), await usdc.balanceOf.call(accounts[2]), await usdc.balanceOf.call(accounts[3])];
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


describe('finalize and destroy game',() => {
    before( async () => {
        accounts = await web3.eth.getAccounts();
        params = default_params;
        params['_account']=accounts[0];
        params['_gameTime']=3;
        // params['_playerContribution'] = 2e15;
         instance = await createNewContract(params);
    
        initGameState = await instance.getGameState.call();
    
        weightage = [1, 1, 1];
        coinsSelected = [0, 1, 2];

        await usdc.approve.sendTransaction(instance.address, playerContribution * 1e1, {from:accounts[1]});
        await usdc.approve.sendTransaction(instance.address, playerContribution * 1e1, {from:accounts[2]});
        await usdc.approve.sendTransaction(instance.address, playerContribution * 1e1, {from:accounts[3]});
        

        await instance.joinGame.sendTransaction(coinsSelected, weightage, playerContribution, {from:accounts[1]});
        await instance.joinGame.sendTransaction(coinsSelected, weightage, playerContribution, {from:accounts[2]});
        await instance.joinGame.sendTransaction(coinsSelected, weightage, playerContribution, {from:accounts[3]});
        await instance.startGame.sendTransaction();
        await timeout(3000);
        await instance.endGame.sendTransaction({from:accounts[0]});
    });

    it('-created a game -3 players joined the game -game started -game ended -prizeDistributed', async function () {
        ;
    });

    it('Should transfer remaining balance to the organization account', async () => {
        var balance = await usdc.balanceOf.call(accounts[0]);
        await instance.finalize.sendTransaction({from:accounts[0]});
        var balance2 = await usdc.balanceOf.call(accounts[0]);
        assert(balance < balance2);
    })
});