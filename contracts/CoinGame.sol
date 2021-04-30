// Coin Fantasy Game
// SPDX-License-Identifier: CoinFantasy Game

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";


contract Game{
    uint256 gameId;
    address gameOwner;
    uint256 gamePool;
    uint256 curNumPlayers;
    uint256 numCoins;
    uint256 gameTime;
    uint256 waitTime;
   
    uint256 numWinners;
    uint256 playerContribution;
    uint256[] winnerWeights;
    uint256 numPlayers;

    uint256 createdTime = block.timestamp;
    uint256 startTime;
    bool live;
    bool completed;
    bool activated;
    address orgAddress = 0x1c4804d9FA63E90dED85aFcCe779b9dD67E00f3a;
    address payable orgWallet = payable(address(orgAddress));
    
    ERC20 usdc;

    struct Player {
        address player;
        uint256[] coins;
        uint256[] weightage;
    }

    mapping(uint256 => Player) players;

    constructor(
        address _token
    ){
        activated = false;
        usdc = ERC20(_token);
        orgAddress = msg.sender;
    }

    function pseudoConstructor(
        uint256 _gameId,//                      -0
        uint256 _numCoins,//                    -1
        uint256 _gameTime,//                    -2
        uint256 _waitTime,//                    -5
        uint256 _numPlayers,//                  -3
        uint256 _numWinners,//                  -4
        uint256[] memory _winnerWeights,//      -5
        uint256 _gamePool,//                    -6
        uint256 _lockIn,//                      -7
        uint256 _playerContribution//           -8
    ) public {

        require(
            _numWinners == _winnerWeights.length,
            "Number of winners doesn't match with the weightage of winners"
        );
        require(gameOwner == msg.sender, "someone else created the contract");


        winnerWeights = _winnerWeights;

        gameId = _gameId;
        
        numPlayers = _numPlayers;
        curNumPlayers = 0;
        numCoins = _numCoins;
        gameTime = _gameTime;
        waitTime = _waitTime;
        numWinners = _numWinners;   
        gamePool = _gamePool;
        playerContribution = _playerContribution;
        live = false;
        completed = false;
        require(buyToken(_lockIn), "Token transaction failed");
        activated = true;
    }

    function buyToken(uint256 amount) public returns (bool) {
        require(amount > 0, "You can't send 0 tokens");
        uint256 allowance = usdc.allowance(msg.sender, address(this));
        require(allowance >= amount, "Check the token allowance");
        usdc.transferFrom(msg.sender, address(this), amount);
        return true;
    }


    

    function joinGame(uint256[] memory coins, uint256[] memory weightage, uint256 amount)
        public
        returns (uint256 _gameId)
    {
        require(gameOwner != msg.sender, "gameOwner can't join the game");
        require(activated, "The game is not yet activated");
        require(curNumPlayers < numPlayers, "The player count reached!");
        require(live == false, "The game has started");
        require(completed == false, "The game has ended");
        require(
            amount >= playerContribution,
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

        Player storage newPlayer = players[curNumPlayers++];
        newPlayer.player = msg.sender;
        newPlayer.coins = coins;
        newPlayer.weightage = weightage;

        require(buyToken(amount), "Token transaction failed");

        return gameId;
    }

    function expireGame() public {
        require(activated, "The game is not yet activated");
        require(curNumPlayers < numPlayers, "Required number of players reached");
        require(
            msg.sender == orgAddress,
            "only the organization can call expire function"
        );
        require(block.timestamp-createdTime > waitTime*1, "Timeout not reached");

        uint256 i;
        for(i = 0; i < curNumPlayers; i++){
            usdc.transfer(players[i].player, playerContribution);
        }
        finalize();
    }

    function startGame() public {
        require(activated, "The game is not yet activated");
        require(curNumPlayers == numPlayers, "Mismatch in number of players.");
        require(
            msg.sender == orgAddress,
            "only the organization can start the game"
        );
        require(block.timestamp-createdTime <= waitTime*1, "Timeout!");
        live = true;
        startTime = block.timestamp;
    }

    

    function endGame() public returns (bool) {
        require(activated, "The game is not yet activated");
        require(
            msg.sender == orgAddress,
            "only the organization can end the game"
        );
        require(live == true, "The game is not live");
        require(completed == false, "The game has already completed");
        require(
            block.timestamp - startTime > gameTime * 1,
            "Game is still in progress"
        );

        live = false;
        completed = true;

        return true;
    }

    function distributePrize(address[] memory winners) public {
        require(activated, "The game is not yet activated");
        uint256 i;
        require(winners.length == numWinners, "Mismatch in number of winners");
        require(
            msg.sender == orgAddress,
            "only the organization can end the game"
        );
        require(live == false, "The game is live");
        require(completed == true, "The game has not been completed");
        require(
            block.timestamp - startTime > gameTime * 1,
            "Game is still in progress"
        );

        for (i = 0; i < winners.length; i++) {
            usdc.transfer(winners[i], winnerWeights[i]);
        }
        payable(gameOwner).transfer(address(this).balance);
        uint256 balance = usdc.balanceOf(address(this));
        usdc.transfer(gameOwner, balance);
        finalize();
    }

    function finalize() public {
        require(
            msg.sender == orgAddress,
            "only the organization can end the game"
        );
        orgWallet.transfer(address(this).balance);
        uint256 rem_balance = usdc.balanceOf(address(this));
        usdc.transfer(orgAddress, rem_balance);
        
        selfdestruct(payable(address(this)));
        
    }

    function getGameState()
        public
        view
        returns (
            uint256,// gameId,                  -0
            address,// gameOwner,               -1
            uint256,// gamePool,                -2
            uint256,// numPlayers,              -3
            uint256,// numCoins,                -4
            uint256,// contractBalance,         -5
            //gameTime - should be in seconds
            uint256,// gameTime,                -6
            uint256,// numWinners,              -7
            uint256,// playerContribution       -8
            uint256,//account balance           -9
            uint256,//startTime                 -10
            uint256//ends in                    -11
            // bool,   //live                   -12
            // bool    //completed              -13
        )
    {
        require(activated, "The game is not activated");
        return (
            gameId,
            gameOwner,
            gamePool,
            curNumPlayers,
            numCoins,
            address(this).balance,
            gameTime,
            numWinners,
            playerContribution,
            address(this).balance,
            startTime,
            gameTime * 1 - (block.timestamp - startTime)
            // live,
            // completed
        );
    }
}
