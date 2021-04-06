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
    uint[] winnerWeights;
    bool live;
    bool completed;
    address orgAddress = 0x604BCD042D2d5B355ecE14B6aC3224d23F29a51c;
    address payable orgWallet = payable(address(orgAddress));

    struct Player {

        address player;
        uint[] coins;
        uint[] weightage;
    }
    
    mapping(uint => Player) players;
    
    constructor(uint _gameId, uint _numCoins, uint _gameTime, uint _numWinners, uint [] memory _winnerWeights,
    uint _gamePool, uint _lockIn, uint _playerContribution) payable {
        
        /*Creator needs to mandatory lock in 10% of the gamePool money
        * Lock In amount needs to be sent from the front end because we cannot calculate
        * floating point (10%) in Solidity.
        * Same for playerContribution - it has to come from the front end since
        * totalGamePool/numOfPlayers cannot be done in Solidity
        */

        require(100*msg.value >= (_lockIn *_gamePool*1 wei), "Creator needs to lockIn 10% to create the game");

        require(_numWinners == _winnerWeights.length, "Number of winners doesn't match with the weightage of winners");

        winnerWeights = _winnerWeights;
        
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
        live = false;
        completed = false;
    }

    //assuming the contract address is availably publically, 
    //steps are taken to restrict the control function

    function startGame() public {


        require(msg.sender==orgAddress, "only the organization can start the game");
        live = true;
    }
    
    function joinGame(uint[] memory coins, uint[] memory weightage) public payable returns(uint _gameId) {

        require(live==false, "The game has started");
        require(completed==false, "The game has ended");
        require(msg.value >= playerContribution, "Player has not contributed the exact amount for the game");
        require(coins.length >= numCoins, "You have to choose at least 7 coins");
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
    
    function gameEnded() public returns(bool) {

        require(msg.sender==orgAddress, "only the organization can end the game");
        require(live==true, "The game is not live");
        require(completed==false, "The game has already completed");
        require(block.timestamp > gameTime, "Game is still in progress");

        live = false;
        completed= true;
        

        //Do the Oracle thing and calculate the winner/winners

        /*

        //for 5 coins
        Based on the logic we decide, distribute the prize within numWinners
        */
        return true;
        
    }
    
    //Change it to internal later, keep public only for testing purposes

    //this is to be set as private function
    function distributePrize(address payable[] memory winners) public {
        uint i;
        require(winners.length==numWinners, "Mismatch in number of winners");
        for(i = 1; i <= winners.length; i++){
            winners[i].transfer(winnerWeights[i]);
        }
        orgWallet.transfer(address(this).balance);
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
        uint, // playerContribution
        uint //account balance
    ){
        return(gameId, gameOwner, gamePool, numPlayers, numCoins, contractBalance, gameTime, numWinners, playerContribution, address(this).balance);
    }
    
    
}
