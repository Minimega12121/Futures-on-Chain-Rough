import { bech32 } from "bech32";
import { task } from 'hardhat/config';
import { HardhatRuntimeEnvironment } from "hardhat/types";

task("deploy", "Deploy the oracle contract")
  .addPositionalParam("roflAppID", "ROFL App ID")
  .setAction(async ({ roflAppID }, hre) => {
    const threshold = 1; // Number of app instances required to submit observations.

    // TODO: Move below to a ROFL helper library (@oasisprotocol/rofl).
    // const rawAppID = rofl.parseAppID(roflAppID);

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
  });


  // task("deploy-token", "Deploys the ERC20 Token")
  // .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
  //   const Token = await hre.ethers.getContractFactory("Token");
  //   const token = await Token.deploy();

  //   // Await the deployment transaction confirmation
  //   await token.deployTransaction;

  //   console.log(`Token deployed at ${token.address}`);
  // });



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
      const marketPrice = await oracle.marketPrice();
      ohlcvHistory.forEach((entry, index) => {
        console.log(`Entry ${index}:`);
        console.log(`  Open: ${entry.open}`);
        console.log(`  High: ${entry.high}`);
        console.log(`  Low: ${entry.low}`);
        console.log(`  Close: ${entry.close}`);
        console.log(`  Volume: ${entry.volume}`);
        console.log(`  Block: ${entry.block}`);


      });
      console.log(`MarketPrice: ${marketPrice}`);
    } catch {
      console.log(`No last observation available.`);
    }
  });
