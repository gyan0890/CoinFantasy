const assert = require("assert");
const Game = artifacts.require("Game");

const Web3 = require('web3');
web3= new Web3(new Web3.providers.HttpProvider('http://localhost:7545'));

var accounts;

describe('CoinGame', () => {
    var instance;
    var sendtoConstruct = 100000;

    before(async function(){
        accounts = await web3.eth.getAccounts();
    });

    beforeEach(async()=>{
        instance = await Game.new(
            0,//game id
            7,//number of coins
            4*3600,//game time
            3,//number of winners
            100000, //game pool
            0, //lock_in percentage
            200000, //player contribution,
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
            const instance2 = instance = await Game.new(0, 7, 4*3600, 3, 100000, 0, 200000,  {from: accounts[0], value: 0});
            assert(false);
        }catch(e){
            ;
        }

    })


});
