
const ethers = require("ethers");


const provider = ethers.getDefaultProvider("ropsten", {
  // Replace the following with your own INFURA API key
  infura: "d2aaf60f86b64e8ab349c9cd9da59031",
});

module.exports = provider;