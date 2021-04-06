import web3 from '../web3';
import CoinGame from '../build/contracts/Game.json';

const instance = new web3.eth.Contract(
	CoinGame.abi,
	//address of crowdly here
	'0xe06a4a843dF975FEb195e7ba869b8eD1ce3f7322'
	);
    console.log('CoinGame instance created!');
export default instance;