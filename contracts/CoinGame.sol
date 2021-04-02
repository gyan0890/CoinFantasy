// Coin Fantasy Game
// SPDX-License-Identifier: CoinFantasy Game

pragma solidity ^0.8.0;
import "@chainlink/contracts/src/v0.6/interfaces/AggregatorV3Interface.sol";


contract Game {
    uint gameId;
    address gameOwner;
    uint gamePool;
    uint numPlayers;
    uint numCoins;
    uint contractBalance;
    //gameTime - should be in seconds
    uint gameTime;
    uint numWinners;
    uint playerContribution;
    
    struct Player {

        address player;
        uint[] coins;
        uint[] weightage;
    }
    
    mapping(uint => Player) players;
    
    constructor(uint _gameId, uint _numCoins, uint _gameTime, uint _numWinners, 
    uint _gamePool, uint _lockIn, uint _playerContribution) payable {
        
        /*Creator needs to mandatory lock in 10% of the gamePool money
        * Lock In amount needs to be sent from the front end because we cannot calculate
        * floating point (10%) in Solidity.
        * Same for playerContribution - it has to come from the front end since
        * totalGamePool/numOfPlayers cannot be done in Solidity
        */
        
        // require(msg.value >= (_lockIn * 1 wei), "Creator needs to lockIn 10% to create the game");
        
        //Generates a unique GameID for every game
        gameId = _gameId;
        gameOwner = msg.sender;
        numPlayers = 0;
        numCoins = _numCoins;
        contractBalance = msg.value;
        gameTime = _gameTime;
        numWinners = _numWinners;
        gamePool = _gamePool;
        playerContribution = _playerContribution;
        
    }
    
    function joinGame(uint[] memory coins, uint[] memory weightage) public payable returns(uint _gameId) {
        require(msg.value == playerContribution, "Player has not contributed the exact amount for the game");
        require(coins.length > 0, "You have to choose at least 7 coins");
        require(weightage.length > 0, "Weightage for coins is not sent");
        require(weightage.length == coins.length, "Weightage for all coins is not present");
        
        uint totalWeightage = 0;
        for(uint i = 0; i< weightage.length; i++){
            totalWeightage+= weightage[i];
        }
        
        require(totalWeightage > 0 && totalWeightage < 100, "Weightage is not proper");
        
        Player storage newPlayer = players[numPlayers++];
        newPlayer.player = msg.sender;
        newPlayer.coins = coins;
        newPlayer.weightage = weightage;
        contractBalance += msg.value;
        return gameId;
        
    }
    
    //Selfdestruct the contract and send the remaining funds to the contract address

    function finalize() public {
        selfdestruct(payable(address(this)));
    }
    
    function gameEnded() public view returns(bool) {
        require(block.timestamp > gameTime, "Game is still in progress");
        //Do the Oracle thing and calculate the winner/winners
        /*
        Based on the logic we decide, distribute the prize within numWinners
        */
        return true;
        
    }
    
    //Change it to internal later, keep public only for testing purposes
    function distributePrize(address payable winner, uint amount) public {
        winner.transfer(amount);
    }

    function getGameState() public view returns (
        uint,// gameId,
        address, // gameOwner,
        uint, // gamePool,
        uint, // numPlayers,
        uint, // numCoins,
        uint, // contractBalance,
        //gameTime - should be in seconds
        uint, // gameTime,
        uint, // numWinners,
        uint // playerContribution
    ){
        return(gameId, gameOwner, gamePool, numPlayers, numCoins, contractBalance, gameTime, numWinners, playerContribution);
    }
    
    
}
