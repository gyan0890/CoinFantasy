const assert = require("assert");
const { before } = require("underscore");
const Game = artifacts.require("Game");
const ERC20 = artifacts.require("ERC20");
const web3 = require('../web3');



//cost
const sendtoConstruct = 100000;
const playerContribution = 1000;
const numberOfCoins = 3;
const gameTime = 10;
const numberOfWinners = 1;
const gamePool = 1000;
const lockIn = 10;
const gameId = 1;
const winnerWeight = [550];

var usdc, accounts, default_params;

accounts = ['0x604BCD042D2d5B355ecE14B6aC3224d23F29a51c']

// before(async function() {
//     // accounts = await web3.eth.getAccounts();
//     // console.log('accounts', accounts);
//     // accounts[1] = '0xBc9Be3d01f9B8a13942Fb70c99342E119410705b';
   

//     return;
// });

default_params = {'_gameId':gameId, '_numberOfCoins': numberOfCoins, '_gameTime': gameTime, 
'_numberOfWinners':numberOfWinners, '_winnerWeight':winnerWeight, '_gamePool':gamePool, 
'_lockIn':lockIn, '_playerContribution':playerContribution, '_account':accounts[0], '_sendtoConstruct':sendtoConstruct};


describe('usdc_contract', async  ()=> {
    it('access the deployed usdc contract', async ()=>{
    usdc = await ERC20.at('0x68ec573C119826db2eaEA1Efbfc2970cDaC869c4');
    await usdc.balanceOf.call(accounts[0]);
    });
});





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


var instance;
describe('Game', async function () {
    var coinsSelected = [0, 5, 3];
    var weightage = [1, 1, 1];
    var initBalance = [];
    params = default_params;
    before(async function () {
        usdc = await ERC20.at('0x68ec573C119826db2eaEA1Efbfc2970cDaC869c4');
        console.log('balanceOf accounts[0]', await usdc.balanceOf.call(accounts[0]));
    })
    it('should create an instance of the contract', async function () {
        instance = await createNewContract(params);
    })
    // it('player 1 should have joined', async function () {

    //     await usdc.approve.sendTransaction(instance.address, playerContribution*10, {from:accounts[1]});
    //     await instance.joinGame.sendTransaction(coinsSelected, weightage, playerContribution, {from:accounts[1]});
    // });
    it('player 1 should have joined', async function () {

        await usdc.approve.sendTransaction(instance.address, playerContribution*10, {from:accounts[0]});
        await instance.joinGame.sendTransaction(coinsSelected, weightage, playerContribution, {from:accounts[0]});
    });
    it('starts the game', async function () {
        await instance.startGame.sendTransaction({from:accounts[0]});
    });
    // it('updates flag', async function () {
    //     let state = await instance.getGameState.call();
    //     assert(state[12]);//game is live
    //     assert(!state[13]);//game hasn't compeleted
    // });
    it('ends game', async function () {
        await timeout(10);
        await instance.endGame.sendTransaction({from:accounts[0]});
    });
    // it('updates flag', async function () {
    //     let state = await instance.getGameState.call();
    //     assert(!state[12]);//game isn't live
    //     assert(state[13]);//game has compeleted
    // });
    it('should distribute prize', async function () {
        initBalance = [await usdc.balanceOf.call(accounts[0]), await usdc.balanceOf.call(accounts[0])];
        await instance.endGame.sendTransaction([accounts[0]], {from:accounts[0]});
    });
    it('should have sent back the tokens', async function () {
        let currentBalance = [await usdc.balanceOf.call(accounts[0]), await usdc.balanceOf.call(accounts[0])];
        assert(currentBalance[0] > initBalance[0]);
    });

});




// describe('constructor', () => {
//     var instance;
    
//     before(async function(){
//         accounts = await web3.eth.getAccounts();   
//     });

//     beforeEach(async()=>{
//         params = default_params;
//         params['_account']=accounts[0];
//         instance = await createNewContract(params);
//     });

//     it("should have created an instance", function () {
//         ;
//     });


//     it("should return the state of the contract", async function  () {
//         await instance.getGameState.call(); 
//     });

//     it("should have contractBalance > 0 and <= " + sendtoConstruct.toString(), async function () {
//         state = await instance.getGameState.call();
//         assert(state[5] > 0 && state[5] <= sendtoConstruct); 
//     });

//     it("should return error if insufficient amount is sent by the game owner", async function(){
//         var error = false;
//         try{
//             await Game.new(1, 7, 4*3600, 3, [450, 250000, 10000],  100000, 10, 200000,  {from: accounts[0], value: 0});
//             console.log('no error, but error expected!')
//         }catch(e){
//             error = true;
//         }
//         assert(error);
//     });

// });


// describe('joinGame', () => {
//     var instance;
//     var coinsSelected = [0, 5, 3, 2, 6, 9, 11];
//     var weightage = [1, 1, 1, 1, 1, 1, 1];
//     var gameIdReturned;

//     before(async function () {
//         accounts = await web3.eth.getAccounts();
//         params = default_params;
//         params['_account']=accounts[0];
//         instance = await createNewContract(params);

//         initGameState = await instance.getGameState.call();
//         initUsdcBalance = await usdc.balanceOf.call(instance.address);
//         await usdc.approve.sendTransaction(instance.address, playerContribution * 1e1, {from:accounts[3]});
        
//         await instance.joinGame.sendTransaction(coinsSelected, weightage, playerContribution, {from:accounts[3]});

//         //call will not modify the state of the contract
//         instance.joinGame.call(coinsSelected, weightage, playerContribution, {from:accounts[3]}).then(function(gameId){gameIdReturned = gameId});
//     });

//     beforeEach(async function(){
//         coinsSelected = [0, 5, 3, 2, 6, 9, 11];
//         weightage = [1, 1, 1, 1, 1, 1, 1];
//     });


//     it('should have created an instance and player 1 should have joined the game', async function(){
//         ;
//     });

//     it('should have upated the contract usdc balance', async function(){
//         var curUsdcBalance = await usdc.balanceOf.call(instance.address);
//         assert(curUsdcBalance > initUsdcBalance);
//     });

//     it('should have upated the time', async function(){
//         await timeout(3000);
//         var curGameState = await instance.getGameState.sendTransaction();
//         var curGameState = await instance.getGameState.call();
//         assert(curGameState[11] < gameTime);
//         console.log('\tTime left: ',curGameState[11].toString() + 's');
//     });

//     it('should return error if # of coins selected are less than'+numberOfCoins.toString(), async function(){
//         coinsSelected = [1, 2];
//         weightage = [1, 1];
//         var error = false;
//         try{
//             await instance.joinGame.sendTransaction(coinsSelected, weightage, playerContribution, {from:accounts[3]});
//         }catch(e){
//             error=true;
//         }
//         assert(error);
//     });

//     it('should return proper game id', async function(){
//         assert(gameId == gameIdReturned);
//     });
    
// });


// describe('startGame', () => {
//   before(async function () {
//     accounts = await web3.eth.getAccounts();
//     params = default_params;
//     params['_account']=accounts[0];
//     instance = await createNewContract(params);

//     initGameState = await instance.getGameState.call();

//     weightage = [1, 1, 1];
//     coinsSelected = [0, 1, 2];
//     await usdc.approve.sendTransaction(instance.address, playerContribution * 1e1, {from:accounts[1]});
//     await usdc.approve.sendTransaction(instance.address, playerContribution * 1e1, {from:accounts[2]});
//     await usdc.approve.sendTransaction(instance.address, playerContribution * 1e1, {from:accounts[3]});
//     await instance.joinGame.sendTransaction(coinsSelected, weightage, playerContribution, {from:accounts[1]}).then(()=>{console.log('\tplayer 1 joined the game!')});
//     await instance.joinGame.sendTransaction(coinsSelected, weightage, playerContribution, {from:accounts[2]}).then(()=>{console.log('\tplayer 2 joined the game!')});
//     await instance.joinGame.sendTransaction(coinsSelected, weightage, playerContribution, {from:accounts[3]}).then(()=>{console.log('\tplayer 3 joined the game!')});
//   });

//   it('should have created deployed a Game contract and 3 players have joined the game', async function () {
//       ;
//   })

//   it('should start the game', async function () {
//     await instance.startGame.sendTransaction({from:accounts[0]});
//   });

//   it('should throw error if someone other than organizer calls startGame', async function () {
//       error= true;
//       try{
//           await instance.startGame.sendTransaction({from:accounts[1]});
//           error = false;
//       }catch(e){;}
//       assert(error);
//   });
// });


// describe('endGame', () => {
//     before(async function () {
//         accounts = await web3.eth.getAccounts();


//         params = default_params;
//         params['_account']=accounts[0];
//         params['_gameTime']=10;
//         instance = await createNewContract(params);
    
//         initGameState = await instance.getGameState.call();
    
//         weightage = [1, 1, 1];
//         coinsSelected = [0, 1, 2];
//         await usdc.approve.sendTransaction(instance.address, playerContribution * 1e1, {from:accounts[1]});
//         await usdc.approve.sendTransaction(instance.address, playerContribution * 1e1, {from:accounts[2]});
//         await usdc.approve.sendTransaction(instance.address, playerContribution * 1e1, {from:accounts[3]});

//         await instance.joinGame.sendTransaction(coinsSelected, weightage, playerContribution, {from:accounts[1]});
//         await instance.joinGame.sendTransaction(coinsSelected, weightage, playerContribution, {from:accounts[2]});
//         await instance.joinGame.sendTransaction(coinsSelected, weightage, playerContribution, {from:accounts[3]});
//         await instance.startGame.sendTransaction();
//     });
  
//     it('should have created deployed a Game contract, 3 players have joined the game and the game should have started', async function () {
//         ;
//     });

//     it('should throw error if the deadline is not reached', async function () {
//         error = true;
//         try{
//             await instance.endGame.sendTransaction({from:accounts[0]});
//             error = false;
//         }catch(e){;}
//         assert(error);
//     });

//     it('should throw error if someone other than organizer calls endGame', async function () {
//         await timeout(10000);
//         error= true;
//         try{
//             await instance.endGame.sendTransaction({from:accounts[1]});
//             error = false;
//         }catch(e){;}
//         assert(error);
//     }); 

//     it('should end the game if the deadline is reached', async function(){
//         await timeout(10000);
//         await instance.endGame.sendTransaction({from:accounts[0]});
//     });

    

// });



// describe('distributePrize', () => {
//     before(async function () {
//         accounts = await web3.eth.getAccounts();
//         params = default_params;
//         params['_account']=accounts[0];
//         params['_gameTime']=3;
//         instance = await createNewContract(params);
    
//         initGameState = await instance.getGameState.call();
    
//         weightage = [1, 1, 1];
//         coinsSelected = [0, 1, 2];

//         await usdc.approve.sendTransaction(instance.address, playerContribution * 1e1, {from:accounts[1]});
//         await usdc.approve.sendTransaction(instance.address, playerContribution * 1e1, {from:accounts[2]});
//         await usdc.approve.sendTransaction(instance.address, playerContribution * 1e1, {from:accounts[3]});


//         await instance.joinGame.sendTransaction(coinsSelected, weightage, playerContribution, {from:accounts[1]});
//         await instance.joinGame.sendTransaction(coinsSelected, weightage, playerContribution, {from:accounts[2]});
//         await instance.joinGame.sendTransaction(coinsSelected, weightage, playerContribution, {from:accounts[3]});
//         await instance.startGame.sendTransaction();
//         await timeout(3000);
//         await instance.endGame.sendTransaction({from:accounts[0]});
      
//     });
  
//     it('-created a game -3 players joined the game -game started -game ended', async function () {
//         ;
//     });


//     it('should distribute prize if the deadline is reached', async function(){
//         var balance = [await usdc.balanceOf.call(accounts[1]), await usdc.balanceOf.call(accounts[2]), await usdc.balanceOf.call(accounts[3])];
//         await instance.distributePrize.sendTransaction([accounts[1], accounts[2], accounts[3]]);
//         var balance2 = [await usdc.balanceOf.call(accounts[1]), await usdc.balanceOf.call(accounts[2]), await usdc.balanceOf.call(accounts[3])];
//         assert(balance < balance2);
        
        
//     });

//     it('should throw error if someone other than organizer calls distributePrize()', async function () {
//         await timeout(10000);
//         error= true;
//         try{
//             await instance.distributePrize.sendTransaction([accounts[1], accounts[2], accounts[3]], {from:accounts[1]});
//             error = false;
//         }catch(e){;}
//         assert(error);
//     });

// });


// describe('finalize and destroy game',() => {
//     before( async () => {
//         accounts = await web3.eth.getAccounts();
//         params = default_params;
//         params['_account']=accounts[0];
//         params['_gameTime']=3;
//         // params['_playerContribution'] = 2e15;
//          instance = await createNewContract(params);
    
//         initGameState = await instance.getGameState.call();
    
//         weightage = [1, 1, 1];
//         coinsSelected = [0, 1, 2];

//         await usdc.approve.sendTransaction(instance.address, playerContribution * 1e1, {from:accounts[1]});
//         await usdc.approve.sendTransaction(instance.address, playerContribution * 1e1, {from:accounts[2]});
//         await usdc.approve.sendTransaction(instance.address, playerContribution * 1e1, {from:accounts[3]});
        

//         await instance.joinGame.sendTransaction(coinsSelected, weightage, playerContribution, {from:accounts[1]});
//         await instance.joinGame.sendTransaction(coinsSelected, weightage, playerContribution, {from:accounts[2]});
//         await instance.joinGame.sendTransaction(coinsSelected, weightage, playerContribution, {from:accounts[3]});
//         await instance.startGame.sendTransaction();
//         await timeout(3000);
//         await instance.endGame.sendTransaction({from:accounts[0]});
//     });

//     it('-created a game -3 players joined the game -game started -game ended -prizeDistributed', async function () {
//         ;
//     });

//     it('Should transfer remaining balance to the organization account', async () => {
//         var balance = await usdc.balanceOf.call(accounts[0]);
//         await instance.finalize.sendTransaction({from:accounts[0]});
//         var balance2 = await usdc.balanceOf.call(accounts[0]);
//         assert(balance < balance2);
//     })
// });