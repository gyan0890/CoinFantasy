const CoinGame = artifacts.require("Game");

module.exports = function (deployer) {
    deployer.deploy(
      CoinGame, 
      0,//game id
      7,//number of coins
      4*3600,//game time
      3,//number of winners
      100000, //game pool
      10, //lock_in percentage
      200000,//player contribution
      );
  };