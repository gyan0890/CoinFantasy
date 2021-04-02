const assert = require("assert");

const Game = artifacts.require("Game");

describe('CoinGame', () => {
    var instance;
    var sendtoConstruct = 100000;
    beforeEach(async()=>{
        instance = await Game.new(
            0,//game id
            7,//number of coins
            4*3600,//game time
            3,//number of winners
            100000, //game pool
            0, //lock_in percentage
            200000, //player contribution,
            {from: '0x44c44C31AC4b37020638600B855a7fb903c0c766', value: sendtoConstruct}
        );
    });

    it("should have created an instance", function () {
        ;
    });


    it("should return the state of the contract", async function  () {
       var state = await instance.getGameState.call(); 
       console.log('state of the contract: ', state);
    });

    it("should have contractBalance > 0 and <= " + sendtoConstruct.toString(), async function () {
        var state = await instance.getGameState.call();
        assert(state[5] > 0 && state[5] <= sendtoConstruct); 
    });


});
