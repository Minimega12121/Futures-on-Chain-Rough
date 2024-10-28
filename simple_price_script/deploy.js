const HDWalletProvider = require('@truffle/hdwallet-provider');
const {Web3} = require('web3');
const { abi, evm } = require('./compile');
const bytecode = evm.bytecode.object;
// const mnemonic = process.env.MNEMONIC;

// if (!mnemonic) {
//     console.error("Mnemonic not found in environment variables");
//     process.exit(1);
// }
const  mnemonic = "test test test test test test test test test test test junk";
const provider = new HDWalletProvider(
    mnemonic,
    'http://localhost:8545'
);

const web3 = new Web3(provider);
const price = 2555;

const deploy = async () => {
    const accounts = await web3.eth.getAccounts();
    console.log('Attempting to deploy from account', accounts[0]);

    const result = await new web3.eth.Contract(abi)
        .deploy({ data: bytecode , arguments: [price] })
        .send({ gas: '1000000', from: accounts[0] });

    console.log('Contract deployed to', result.options.address);
    console.log(abi);
    provider.engine.stop();
};

deploy();
