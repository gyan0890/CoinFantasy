// Coin Fantasy Game
// SPDX-License-Identifier: CoinFantasy Game

pragma solidity ^0.8.0;


contract Game {
    uint256 gameId;
    address gameOwner;
    uint256 gamePool;
    uint256 numPlayers;
    uint256 numCoins;
    // uint256 contractBalance;
    uint256 gameTime;
    uint256 numWinners;
    uint256 playerContribution;
    uint256[] winnerWeights;
    bool live;
    bool completed;
    address orgAddress = 0x0d77B3d1E78e6DE6e0326E08B4B9CF1791e4E236;
    address payable orgWallet = payable(address(orgAddress));
    uint256 startTime = block.timestamp;
    // int256[] startPrice;
    // int256[] endPrice;

    struct Player {
        address player;
        uint256[] coins;
        uint256[] weightage;
    }

    mapping(uint256 => Player) players;

    constructor(
        uint256 _gameId,
        uint256 _numCoins,
        uint256 _gameTime,
        uint256 _numWinners,
        uint256[] memory _winnerWeights,
        uint256 _gamePool,
        uint256 _lockIn,
        uint256 _playerContribution
    ) payable {

        require(
            100 * msg.value >= (_lockIn * _gamePool * 1 wei),
            "Creator needs to lockIn 10% to create the game"
        );

        require(
            _numWinners == _winnerWeights.length,
            "Number of winners doesn't match with the weightage of winners"
        );

        winnerWeights = _winnerWeights;

        gameId = _gameId;
        gameOwner = msg.sender;
        numPlayers = 0;
        numCoins = _numCoins;
        // contractBalance = msg.value;
        gameTime = _gameTime;
        numWinners = _numWinners;
        gamePool = _gamePool;
        playerContribution = _playerContribution;
        live = false;
        completed = false;
    }


    function startGame() public {
        require(numPlayers == 3, "Mismatch in number of players.");
        require(
            msg.sender == orgAddress,
            "only the organization can start the game"
        );
        live = true;
    }

    function joinGame(uint256[] memory coins, uint256[] memory weightage)
        public
        payable
        returns (uint256 _gameId)
    {
        require(numPlayers < 3, "The player count reached!");
        require(live == false, "The game has started");
        require(completed == false, "The game has ended");
        require(
            msg.value >= playerContribution,
            "Player has not contributed the exact amount for the game"
        );
        require(
            coins.length >= numCoins,
            "You have to choose at least 7 coins"
        );
        require(weightage.length > 0, "Weightage for coins is not sent");
        require(
            weightage.length == coins.length,
            "Weightage for all coins is not present"
        );

        uint256 totalWeightage = 0;
        for (uint256 i = 0; i < weightage.length; i++) {
            totalWeightage += weightage[i];
        }

        require(
            totalWeightage > 0 && totalWeightage < 100,
            "Weightage is not proper"
        );

        Player storage newPlayer = players[numPlayers++];
        newPlayer.player = msg.sender;
        newPlayer.coins = coins;
        newPlayer.weightage = weightage;
        // contractBalance += msg.value;
        return gameId;
    }


    function finalize() public {
        selfdestruct(payable(address(this)));
    }

    function endGame() public returns (bool) {
        require(
            msg.sender == orgAddress,
            "only the organization can end the game"
        );
        require(live == true, "The game is not live");
        require(completed == false, "The game has already completed");
        require(block.timestamp - startTime> gameTime * 1, "Game is still in progress");

        live = false;
        completed = true;
        

        return true;
    }

    function distributePrize(address payable[] memory winners) public {
        uint256 i;
        require(winners.length == numWinners, "Mismatch in number of winners");
        require(
            msg.sender == orgAddress,
            "only the organization can end the game"
        );
        require(live == false, "The game is live");
        require(completed == true, "The game has not been completed");
        require(block.timestamp - startTime > gameTime * 1, "Game is still in progress");

        for (i = 1; i <= winners.length; i++) {
            winners[i].transfer(winnerWeights[i]);
        }
        payable(gameOwner).transfer(address(this).balance);
    }

    function getGameState()
        public
        view
        returns (
            uint256, // gameId,
            address, // gameOwner,
            uint256, // gamePool,
            uint256, // numPlayers,
            uint256, // numCoins,
            uint256, // contractBalance,
            //gameTime - should be in seconds
            uint256, // gameTime,
            uint256, // numWinners,
            uint256, // playerContribution
            uint256, //account balance
            uint256,  //startTime
            uint256   //ends in
        )
    {
        return (
            gameId,
            gameOwner,
            gamePool,
            numPlayers,
            numCoins,
            address(this).balance,
            gameTime,
            numWinners,
            playerContribution,
            address(this).balance,
            startTime,
            gameTime * 1 - (block.timestamp - startTime)
        );
    }
}
