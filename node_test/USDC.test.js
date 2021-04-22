const ERC20 = require("../build/contracts/ERC20.json");
const web3 = require('../web3');

// describe('balanceOf', async() => {
//     var usdc = await web3.eth.Contract(ERC20, "0x07865c6E87B9F70255377e024ace6630C1Eaa37F");
    
//     beforeEach(async function(){
//         console.log('getting accounts');
//         accounts = await web3.eth.getAccounts();   
//     });    

//     it('should return balance', async ()=>{
//         console.log(await usdc.balanceOf(accounts[0]));
//         console.log('printed');
//     });
// });


async function main() {
    accounts = await web3.eth.getAccounts(); 
    console.log(accounts);
    var usdc = await new web3.eth.Contract(ERC20.abi, "0x07865c6E87B9F70255377e024ace6630C1Eaa37F");
    var balance = await usdc.methods.balanceOf(accounts[0]).call();
    console.log(balance);
    await usdc.methods.transfer('0xBc9Be3d01f9B8a13942Fb70c99342E119410705b', 1000).send({
        from: accounts[0]
    });
    var balance = await usdc.methods.balanceOf(accounts[0]).call();
    console.log(balance);
    return;
}

main();