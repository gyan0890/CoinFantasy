// import Portis from '@portis/web3';
import Web3 from 'web3';
const {projectId} = require('./secrets.json');
console.log(projectId);

// const portis = new Portis('c4eb0bfb-bbcb-4e23-8c38-f41129f1469f', 'maticMumbai');
// let web3; 
// web3 = new Web3(portis.provider);

if(typeof window !== 'undefined' && typeof window.web3 !== 'undefined'){
    console.log('web3 available');
    web3 = new Web3(window.web3.currentProvider);
}else {
    console.log('injecting metamask from infura');
    const provider = new Web3.providers.HttpProvider(
        projectId
    );
    
    web3 = new Web3(provider);
}

export default web3;