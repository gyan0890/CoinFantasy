const assert = require("assert");
const Game = artifacts.require("Game");
const ERC20 = artifacts.require("ERC20");
const USDC = artifacts.require("USDC_coin");



const sendtoConstruct = 100000;
const playerContribution = 1000;
const numberOfCoins = 3;
const gameTime = 10;
const waitTime = 10;
const numPlayers = 1;
const numberOfWinners = 1;
const gamePool = 1000;
const lockIn = 1000;
const gameId = 1;
const winnerWeight = [550];

var usdc, accounts, default_params;

accounts = ['0x4CB1777965c956E620648245794145382Bdfd620'];

default_params = {'_gameId':gameId, '_numberOfCoins': numberOfCoins, '_gameTime': gameTime,  '_waitTime': waitTime,'_numPlayers': numPlayers,
'_numberOfWinners':numberOfWinners, '_winnerWeight':winnerWeight, '_gamePool':gamePool, 
'_lockIn':lockIn, '_playerContribution':playerContribution, '_account':accounts[0], '_sendtoConstruct':sendtoConstruct,
'_token':'0x68ec573c119826db2eaea1efbfc2970cdac869c4'};


before(async function() {
    usdc = await USDC.new();
    accounts = await web3.eth.getAccounts();
    usdc_pool = await usdc.balanceOf(accounts[0]);

    for(let i = 1; i < 10; i++){
        await usdc.transfer.sendTransaction(accounts[i], usdc_pool/1e10, {from:accounts[0]});
    }

    default_params = {'_gameId':gameId, '_numberOfCoins': numberOfCoins, '_gameTime': gameTime, 
    '_numberOfWinners':numberOfWinners, '_winnerWeight':winnerWeight, '_gamePool':gamePool, 
    '_lockIn':lockIn, '_playerContribution':playerContribution, '_account':0, '_sendtoConstruct':sendtoConstruct, 
    '_token':usdc.address, '_orgAddress':accounts[0]};

    return;
});


describe('usdc_contract', async  ()=> {
    it('access the deployed usdc contract', async ()=>{
    usdc = await ERC20.at(default_params['_token']);
    console.log('account[0] balance: ', (await usdc.balanceOf.call(accounts[0])).toString());
    });
});


function timeout(s) {
    return new Promise(resolve => setTimeout(resolve, 1e3*s));
}


async function createNewContract(params = default_params){
    return new Promise( async function (resolve, reject){
        params['_token'] = usdc.address;
        const deployedContract = await Game.new(params['_token'], {from:accounts[0]});
        await usdc.approve.sendTransaction(deployedContract.address, params['_lockIn'], {from:accounts[0]});
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
            {
                from:accounts[0]
            }
        );
        return resolve(deployedContract);
    });
}




var instance;
describe('Game', async function () {
    var coinsSelected = [0, 5, 3];
    var weightage = [1, 1, 1];
    var initBalance = [];
    params = default_params;
    params['_numPlayers']=1;

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
        await timeout(12);
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

describe('Expired Game', async function () {
    params = default_params;

    it('should create an instance of the contract', async function () {
        instance = await createNewContract(params);
    })
    
    it('calls expire function game', async function () {
        await timeout(12);
        await instance.expiredGame.sendTransaction({from:accounts[0]});
    });

});
