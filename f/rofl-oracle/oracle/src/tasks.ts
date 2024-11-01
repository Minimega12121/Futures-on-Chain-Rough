import { bech32 } from "bech32";
import { task } from 'hardhat/config';
import { HardhatRuntimeEnvironment } from "hardhat/types";

task("deploy", "Deploy the oracle contract")
  .addPositionalParam("roflAppID", "ROFL App ID")
  .setAction(async ({ roflAppID }, hre) => {
    const threshold = 1; // Number of app instances required to submit observations.

    // TODO: Move below to a ROFL helper library (@oasisprotocol/rofl).
    // const rawAppID = rofl.parseAppID(roflAppID);


    const token = await hre.ethers.deployContract("Token", []);
    await token.waitForDeployment();

    console.log(`Token deployed to ${token.target}`);

    const {prefix, words} = bech32.decode(roflAppID);
    if (prefix !== "rofl") {
      throw new Error(`Malformed ROFL app identifier: ${roflAppID}`);
    }
    const rawAppID = new Uint8Array(bech32.fromWords(words));

    // Deploy a new instance of the oracle contract configuring the ROFL app that is
    // allowed to submit observations and the number of app instances required.
    const oracle = await hre.ethers.deployContract("Oracle", [rawAppID, threshold], {});
    await oracle.waitForDeployment();

    console.log(`Oracle for ROFL app ${roflAppID} deployed to ${oracle.target}`);

    // Mint tokens to the Oracle contract
    const mintAmount = hre.ethers.parseUnits("1000000", 18); // Mint 1,000,000 tokens
    await token.mint(oracle.target, mintAmount);
    console.log(`Minted ${mintAmount.toString()} tokens to Oracle contract`);

  });

task("mint", "Mint tokens to the an address")
  .addParam("contractAddress", "The contract to mint tokens to")
  .setAction(async ({ contractAddress }, { ethers }) => {
      const token = await ethers.getContractAt("Token", "0x5FbDB2315678afecb367f032d93F642f64180aa3");
      const mintAmount = ethers.parseUnits("1000000", 18); // Mint 1,000,000 tokens
      await token.mint(contractAddress,mintAmount);
      console.log(`Minted ${mintAmount.toString()} tokens to ${contractAddress}`);
  });

task("oracle-query", "Queries the oracle contract")
  .addPositionalParam("contractAddress", "The deployed contract address")
  .setAction(async ({ contractAddress }, { ethers }) => {
    const oracle = await ethers.getContractAt("Oracle", contractAddress);

    console.log(`Using oracle contract deployed at ${oracle.target}`);

    const rawRoflAppID = await oracle.roflAppID();
    const historyIndex = await oracle.historyIndex();
    // TODO: Move below to a ROFL helper library (@oasisprotocol/rofl).
    const roflAppID = bech32.encode("rofl", bech32.toWords(ethers.getBytes(rawRoflAppID)));
    const threshold = await oracle.threshold();
    const call = await oracle.calls();
    console.log(`ROFL app:  ${roflAppID}`);
    console.log(`Threshold: ${threshold}`);
    console.log(`Call: ${call}`);
    console.log(`History index: ${historyIndex}`);
    try {
      const ohlcvHistory = await oracle.getOHLCVHistory();
      const marketPrice = await oracle.currentMarketPrice();
      // uint128 public currentMarketPrice=0;
      // uint128 public dailyExchangeVolume=0;
      // uint128 public dailyHigh=0;
      // uint128 public dailyLow=0;
      // uint128 public indexPrice=0;
      const indexPrice = await oracle.indexPrice();
      const dailyLow = await oracle.dailyLow();
      const dailyHigh = await oracle.dailyHigh();
      const dailyExchangeVolume = await oracle.dailyExchangeVolume();
      const modelSignal = await oracle.modelSignal();

      ohlcvHistory.forEach((entry, index) => {
        console.log(`Entry ${index}:`);
        console.log(`Open: ${entry.open}`);
        console.log(`High: ${entry.high}`);
        console.log(`Low: ${entry.low}`);
        console.log(`Close: ${entry.close}`);
        console.log(`Volume: ${entry.volume}`);
        console.log(`Block: ${entry.blockNumber}`);
      });
      console.log(`MarketPrice: ${marketPrice}`);
      console.log(`IndexPrice: ${indexPrice}`);
      console.log(`DailyLow: ${dailyLow}`);
      console.log(`DailyHigh: ${dailyHigh}`);
      console.log(`DailyExchangeVolume: ${dailyExchangeVolume}`);
      console.log(`ModelSignal: ${modelSignal}`);
    } catch {
      console.log(`No last observation available.`);
    }
  });

  task("open-position", "Opens a futures position")
  .addParam("contract", "The deployed Oracle contract address")
  .addParam("leverage", "The leverage for the position")
  .addParam("tokenamount", "The token amount for the position")
  .addFlag("buy", "Whether to buy or sell the position")
  .setAction(async (taskArgs, hre) => {
    const { contract, leverage, tokenamount } = taskArgs;
    const Oracle = await hre.ethers.getContractAt("Oracle", contract);
    const marketPrice = await Oracle.currentMarketPrice();
    const [signer] = await hre.ethers.getSigners();
  console.log("Using account:", signer.address);
   const buy =  taskArgs.buy ? true : false;
    // Call openPosition on the deployed contract
    const tx = await Oracle.openPosition(leverage, tokenamount, buy);
    await tx.wait();
    console.log(`Position opened with leverage: ${leverage} and token amount: ${tokenamount}`);
    console.log(`At market price ${marketPrice}`);
  });

//npx hardhat open-position --buy --contract 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512 --leverage 30 --tokenamount 150 --network sapphire-localnet

task("get-pnl", "Retrieves the PnL of a specific position index")
.addParam("contract", "The deployed Oracle contract address")
.addParam("address", "The address of the position owner")
.setAction(async (taskArgs, hre) => {
  const { contract ,address}= taskArgs;
  const Oracle = await hre.ethers.getContractAt("Oracle", contract);
  const [signer] = await hre.ethers.getSigners();
  console.log("Using account:", address);

  const openPosCount = await Oracle.positionsCount(address,0);
  console.log(`Open positions count: ${openPosCount}`);
  for(let index = 0; index < openPosCount; index++) {
    const openPos = await Oracle.openPositions(address, index);

  console.log(`EntryPrice: ${openPos.entryPrice}`);
  console.log(`Leverage: ${openPos.leverage}`);
  console.log(`TokenUnits: ${openPos.tokenUnits}`);
  console.log(`Collateral: ${openPos.collateral}`);
  //console.log(`Buy: ${openPos.isBuy}`);

  const  pnl = await Oracle.calculatePnL(address,index);
  console.log(`PnL for position ${index}: ${pnl}`);
  }

});

task("close", "Retrieves the PnL of a specific position index")
.addParam("contract", "The deployed Oracle contract address")
.addParam("index", "The index of the position to close")
.setAction(async (taskArgs, hre) => {
  const { contract }= taskArgs;
  const Oracle = await hre.ethers.getContractAt("Oracle", contract);
  const [signer] = await hre.ethers.getSigners();
  console.log("Using account:", signer.address);

  const closePos =  await Oracle.closePosition(taskArgs.index);

  console.log(`Position closed`);
});

task("get-orderbook-history", "Retrieves the orderbook history from the Oracle contract")
  .addParam("contract", "The deployed Oracle contract address")
  .setAction(async (taskArgs, hre) => {
    const { contract } = taskArgs;
    const Oracle = await hre.ethers.getContractAt("Oracle", contract);
    const [signer] = await hre.ethers.getSigners();
    console.log("Using account:", signer.address);

    // Fetch the entire orderbook history
    const orderbookHistory = await Oracle.getOrderbookHistory();

    console.log("Orderbook History:");
    orderbookHistory.forEach((entry, index) => {
      console.log(`Entry ${index + 1}:`);
      console.log(`  Bid Price: ${entry.bidPrice.toString()}`);
      console.log(`  Bid Volume: ${entry.bidVolume.toString()}`);
      console.log(`  Ask Price: ${entry.askPrice.toString()}`);
      console.log(`  Ask Volume: ${entry.askVolume.toString()}`);
      console.log(`  Block Number: ${entry.blockNumber.toString()}`);
    });
  });

  task("transfer-native-token", "Transfers native tokens from msg.sender to the specified account in ether")
  .addParam("account", "The recipient account address")
  .addParam("amount", "The amount of native tokens to send (in ether)")
  .setAction(async (taskArgs, hre) => {
    const { account, amount } = taskArgs;
    const [sender] = await hre.ethers.getSigners();

    console.log("Transferring native tokens...");
    console.log(`Sender: ${sender.address}`);
    console.log(`Recipient: ${account}`);
    console.log(`Amount: ${amount} ether`);

    try {
      const tx = await sender.sendTransaction({
        to: account,
        value: hre.ethers.parseEther(amount), // Convert amount from ether to wei
      });
      await tx.wait();
      console.log(`Successfully transferred ${amount} ether to ${account}`);
    } catch (error) {
      console.error("Transfer failed:", error);
    }
  });


// npx hardhat open-position --buy --contract 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512 --leverage 30 --tokenamount 150 --network sapphire-localnet
// npx hardhat oracle-query 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512 --network sapphire-localnet
// npx hardhat get-orderbook-history --contract 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512 --network sapphire-localnet
// npx hardhat get-pnl --contract 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512 --address 0xfcd1e86925C9c066d31AacC78c9e7De32b4574Ae --network sapphire-localnet
