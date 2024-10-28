const assert = require('assert');
const { Web3 } = require('web3'); // constructor
const ganache = require('ganache');

const { abi, evm } = require('../compile');
const { callbackify } = require('util');

// Access the bytecode correctly
const bytecode = evm.bytecode.object;

const web3 = new Web3(ganache.provider()); // Ganache is for local test network

let accounts;
let lottery;

beforeEach(async () => {
    // Get a list of all accounts
    accounts = await web3.eth.getAccounts();

    // Use one of those accounts to deploy the contract
    lottery = await new web3.eth.Contract(abi)
        .deploy({ data: bytecode })
        .send({ from: accounts[0], gas: '1000000' });
});

describe('Lottery Contract', () => {
    it('deploys a contract', () => {
        assert.ok(lottery.options.address);
    });

    it('manager correctly assigned',async ()=>{
        assert.equal(accounts[0],await lottery.methods.manager().call())
    });

    it('one player can enter', async() => {
        await lottery.methods.enter().send({
            from:accounts[0],
            value: web3.utils.toWei('0.02','ether')
        });

        const players =  await lottery.methods.getPlayers().call({
            form: accounts[0]
        });

        assert.equal(accounts[0], players[0]);

        assert.equal(1, players.length);

    });

    it('one player can enter', async() => {
        await lottery.methods.enter().send({
            from:accounts[0],
            value: web3.utils.toWei('0.02','ether')
        });

        const players =  await lottery.methods.getPlayers().call({
            form: accounts[0]
        });

        assert.equal(accounts[0], players[0]);

        assert.equal(1, players.length);

    });
    it('many player can enter', async() => {
        for (let index = 0; index <10; index++) {
            await lottery.methods.enter().send({
                from:accounts[index],
                value: web3.utils.toWei('0.02','ether')
            });
            const players =  await lottery.methods.getPlayers().call({
                form: accounts[index]
            });

            assert.equal(accounts[index], players[index]);

            assert.equal(index+1, players.length);
        }
    });

    it('requires minimum amount of ether', async () => {
        try{
            await lottery.methods.enter().send(
                {
                    form: acoounts[0],
                    value: 1
                }
            )
            assert(false);
        }
        catch (err)
        {
            assert(err);
        }
    });

    it('only manager can call pick winner', async ()=>{
        try{
            await lottery.methods.enter().send(
                {
                    form: acoounts[1],
                }
            )
            assert(false);
        }catch (err){
            assert(err);
        }
    });


    it('sends money to winner and resets', async ()=>{
        await lottery.methods.enter().send(
            {
                from : accounts[0],
                value : web3.utils.toWei('1','ether')
            }
        )

        const initialBalance = await web3.eth.getBalance(accounts[0]);
        await lottery.methods.pickWinner().send({from:accounts[0]});

        const finalBalance = await web3.eth.getBalance(accounts[0]);
        const difference = finalBalance - initialBalance;
        assert.equal(true,difference > web3.utils.toWei('0.8','ether'));

        const players =  await lottery.methods.getPlayers().call({
            form: accounts[6]
        });

        assert.equal(0,players.length);
    });
});
