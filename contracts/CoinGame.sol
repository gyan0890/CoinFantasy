// Coin Fantasy Game
// SPDX-License-Identifier: CoinFantasy Game

pragma solidity ^0.8.0;

// import "@chainlink/contracts/src/v0.6/interfaces/AggregatorV3Interface.sol";
// import "https://github.com/smartcontractkit/chainlink/blob/master/evm-contracts/src/v0.6/interfaces/AggregatorV3Interface.sol";

contract Game {
    uint256 gameId;
    address gameOwner;
    uint256 gamePool;
    uint256 numPlayers;
    uint256 numCoins;
    uint256 contractBalance;
    //gameTime - should be in seconds
    uint256 gameTime;
    uint256 numWinners;
    uint256 playerContribution;
    uint256[] winnerWeights;
    bool live;
    bool completed;
    address orgAddress = 0x604BCD042D2d5B355ecE14B6aC3224d23F29a51c;
    address payable orgWallet = payable(address(orgAddress));
    // AggregatorV3Interface[] internal priceFeed;
    int256[] startPrice;
    int256[] endPrice;

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
        /*Creator needs to mandatory lock in 10% of the gamePool money
         * Lock In amount needs to be sent from the front end because we cannot calculate
         * floating point (10%) in Solidity.
         * Same for playerContribution - it has to come from the front end since
         * totalGamePool/numOfPlayers cannot be done in Solidity
         */

        // priceFeed.push(AggregatorV3Interface(0x8A753747A1Fa494EC906cE90E9f37563A8AF630e));//ETH
        // priceFeed.push(AggregatorV3Interface(0xd8bD0a1cB028a31AA859A21A3758685a95dE4623));//LINK
        // priceFeed.push(AggregatorV3Interface(0xECe365B379E1dD183B20fc5f022230C044d51404));//BTC
        require(
            100 * msg.value >= (_lockIn * _gamePool * 1 wei),
            "Creator needs to lockIn 10% to create the game"
        );

        require(
            _numWinners == _winnerWeights.length,
            "Number of winners doesn't match with the weightage of winners"
        );

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
        require(numPlayers == 3, "Mismatch in number of players.");
        require(
            msg.sender == orgAddress,
            "only the organization can start the game"
        );
        live = true;

        // uint i;
        // for(i=0; i < numCoins; i++){
        //     (
        //         uint80 roundID,
        //         int price,
        //         uint startedAt,
        //         uint timeStamp,
        //         uint80 answeredInRound
        //     ) = priceFeed[i].latestRoundData();
        //     startPrice.push(price);
        // }
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
        contractBalance += msg.value;
        return gameId;
    }

    //Selfdestruct the contract and send the remaining funds to the contract address

    function finalize() public {
        selfdestruct(payable(address(this)));
    }

    function gameEnded() public returns (bool) {
        require(
            msg.sender == orgAddress,
            "only the organization can end the game"
        );
        require(live == true, "The game is not live");
        require(completed == false, "The game has already completed");
        require(block.timestamp > gameTime, "Game is still in progress");

        live = false;
        completed = true;
        // uint i;
        // for(i=0; i < numCoins; i++){
        //     (
        //         uint80 roundID,
        //         int price,
        //         uint startedAt,
        //         uint timeStamp,
        //         uint80 answeredInRound
        //     ) = priceFeed[i].latestRoundData();
        //     endPrice.push(price);
        // }

        //Do the Oracle thing and calculate the winner/winners

        /*

        //for 5 coins
        Based on the logic we decide, distribute the prize within numWinners
        */
        return true;
    }

    // function sendData() public view returns(int[] memory, int[] memory){
    //     return (startPrice, endPrice);
    // }

    //Change it to internal later, keep public only for testing purposes

    //this is to be set as private function
    function distributePrize(address payable[] memory winners) public {
        uint256 i;
        require(winners.length == numWinners, "Mismatch in number of winners");
        require(
            msg.sender == orgAddress,
            "only the organization can end the game"
        );
        require(live == false, "The game is live");
        require(completed == true, "The game has not been completed");
        require(block.timestamp > gameTime, "Game is still in progress");

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
            uint256 //account balance
        )
    {
        return (
            gameId,
            gameOwner,
            gamePool,
            numPlayers,
            numCoins,
            contractBalance,
            gameTime,
            numWinners,
            playerContribution,
            address(this).balance
        );
    }
}
