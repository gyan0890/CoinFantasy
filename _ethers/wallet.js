const ethers = require("ethers");

// Replace the following with your own mnemonic
const mnemonic =
  "stem tone yard evolve tail creek catalog general winter sadness cluster ticket";
// const mnemonic =
//   "rabbit enforce proof always embrace tennis version reward scout shock license wing";
const wallet = ethers.Wallet.fromMnemonic(mnemonic);

console.log(`Mnemonic: ${wallet.mnemonic.phrase}`);
console.log(`Address: ${wallet.address}`);

module.exports = wallet;