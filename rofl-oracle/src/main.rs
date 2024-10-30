use oasis_runtime_sdk::modules::rofl::app::prelude::*;
use std::sync::Arc;
use tokio::time::{self, Duration};
use serde_json::Value;
use anyhow::Result;

/// Address where the oracle contract is deployed.
// #region oracle-contract-address
const ORACLE_CONTRACT_ADDRESS: &str = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"; // TODO: Replace with your contract address.

struct OracleApp;

#[async_trait]
impl App for OracleApp {
    /// Application version.
    const VERSION: Version = sdk::version_from_cargo!();

    /// Identifier of the application (used for registrations).
    // #region app-id
    fn id() -> AppId {
        "rofl1qqn9xndja7e2pnxhttktmecvwzz0yqwxsquqyxdf".into() // TODO: Replace with your application ID.
    }
    // #endregion app-id

    /// Return the consensus layer trust root for this runtime; if `None`, consensus layer integrity
    /// verification will not be performed (e.g. Localnet).
    // #region consensus-trust-root
    fn consensus_trust_root() -> Option<TrustRoot> {
        // The trust root below is for Sapphire Testnet at consensus height 22110615.
        None
    }
    // #endregion consensus-trust-root

    async fn run(self: Arc<Self>, _env: Environment<Self>) {
        // We are running now!
        println!("Hello ROFL world!");
    }

    async fn on_runtime_block(self: Arc<Self>, env: Environment<Self>, _round: u64) {
        // This gets called for each runtime block. It will not be called again until the previous
        // invocation returns and if invocation takes multiple blocks to run, those blocks will be
        // skipped.
        if let Err(err) = self.run_oracle(env).await {
            println!("Failed to submit observation: {:?}", err);
        }
    }
}

impl OracleApp {
    /// Fetch OHLCV data from CryptoCompare and submit it to the Oracle contract.
    async fn run_oracle(self: Arc<Self>, env: Environment<Self>) -> Result<()> {
            let response: Value = rofl_utils::https::agent()
                .get("https://min-api.cryptocompare.com/data/v2/histominute?fsym=ETH&tsym=USD&limit=10&api_key=3df9cc83af512bebeb5f27bcd1f73556459b93e2fa410f748aa25d3e30213ccf")
                .call()?
                .body_mut()
                .read_json()?;

            let data_points = response["Data"]["Data"]
                .as_array()
                .ok_or_else(|| anyhow::anyhow!("Data not found"))?;
            let data = data_points[0].as_object().ok_or_else(|| anyhow::anyhow!("Data not found"))?;

                let open = (data["open"].as_f64().ok_or_else(|| anyhow::anyhow!("Open not found"))? * 1_000_000.0) as u128;
                let high = (data["high"].as_f64().ok_or_else(|| anyhow::anyhow!("High not found"))? * 1_000_000.0) as u128;
                let low = (data["low"].as_f64().ok_or_else(|| anyhow::anyhow!("Low not found"))? * 1_000_000.0) as u128;
                let close = (data["close"].as_f64().ok_or_else(|| anyhow::anyhow!("Close not found"))? * 1_000_000.0) as u128;
                let volume = (data["volumefrom"].as_f64().ok_or_else(|| anyhow::anyhow!("Volume not found"))? * 1_000_000.0) as u128;

                let tx_data = [
                    ethabi::short_signature("submitOHLCVObservation", &[
                        ethabi::ParamType::Uint(128),
                        ethabi::ParamType::Uint(128),
                        ethabi::ParamType::Uint(128),
                        ethabi::ParamType::Uint(128),
                        ethabi::ParamType::Uint(128),
                    ]).to_vec(),
                    ethabi::encode(&[
                        ethabi::Token::Uint(open.into()),
                        ethabi::Token::Uint(high.into()),
                        ethabi::Token::Uint(low.into()),
                        ethabi::Token::Uint(close.into()),
                        ethabi::Token::Uint(volume.into()),
                    ]),
                ].concat();

                let mut tx = self.new_transaction(
                    "evm.Call",
                    module_evm::types::Call {
                        address: ORACLE_CONTRACT_ADDRESS.parse().unwrap(),
                        value: 0.into(),
                        data: tx_data,
                    },
                );
                tx.set_fee_gas(1_000_000);

                env.client().sign_and_submit_tx(env.signer(), tx).await?;


          // Fetch OHLCV data
        let response: Value = rofl_utils::https::agent()
        .get("https://min-api.cryptocompare.com/data/v2/histoday?fsym=ETH&tsym=USD&limit=1&api_key=3df9cc83af512bebeb5f27bcd1f73556459b93e2fa410f748aa25d3e30213ccf")
        .call()?
        .body_mut()
        .read_json()?;

    let data = response["Data"]["Data"][0]
        .as_object()
        .ok_or_else(|| anyhow::anyhow!("OHLCV data missing"))?;

    let high = (data["high"].as_f64().unwrap() * 1_000_000.0) as u128;
    let low = (data["low"].as_f64().unwrap() * 1_000_000.0) as u128;
    let volume = (data["volumeto"].as_f64().unwrap() * 1_000_000.0) as u128;

    // Fetch Index Price (current market price)
    let price_response: Value = rofl_utils::https::agent()
        .get("https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD&api_key=3df9cc83af512bebeb5f27bcd1f73556459b93e2fa410f748aa25d3e30213ccf")
        .call()?
        .body_mut()
        .read_json()?;

    let market_price = (price_response["USD"].as_f64().unwrap() * 1_000_000.0) as u128;

    // Prepare and submit the transaction to the Oracle contract
    let tx_data = [
        ethabi::short_signature("submitMarketObservations", &[
            ethabi::ParamType::Uint(128),
            ethabi::ParamType::Uint(128),
            ethabi::ParamType::Uint(128),
            ethabi::ParamType::Uint(128)
        ])
        .to_vec(),
        ethabi::encode(&[
            ethabi::Token::Uint(market_price.into()),
            ethabi::Token::Uint(volume.into()),
            ethabi::Token::Uint(high.into()),
            ethabi::Token::Uint(low.into())
        ]),
    ]
    .concat();

    let mut tx = self.new_transaction(
        "evm.Call",
        module_evm::types::Call {
            address: ORACLE_CONTRACT_ADDRESS.parse().unwrap(),
            value: 0.into(),
            data: tx_data,
        },
    );

    tx.set_fee_gas(3_000_000);
    env.client().sign_and_submit_tx(env.signer(), tx).await?;


    let response: Value = rofl_utils::https::agent()
    .get("https://min-api.cryptocompare.com/data/ob/l1/top?fsyms=ETH&tsyms=USD&api_key=3df9cc83af512bebeb5f27bcd1f73556459b93e2fa410f748aa25d3e30213ccf&e=coinbase")
    .call()?
    .body_mut()
    .read_json()?;

// Extract the data for bid and ask prices
let bid_price = response["Data"]["RAW"]["ETH"]["USD"]["BID"]
    .as_f64()
    .ok_or_else(|| anyhow::anyhow!("Bid price not found"))? * 1_000_000.0;
let ask_price = response["Data"]["RAW"]["ETH"]["USD"]["ASK"]
    .as_f64()
    .ok_or_else(|| anyhow::anyhow!("Ask price not found"))? * 1_000_000.0;

// Set a fixed volume for example, as the response structure here doesn't have bid/ask volumes.
let bid_volume = 1000000u128; // Placeholder, replace with actual volume logic if needed
let ask_volume = 1000000u128; // Placeholder, replace with actual volume logic if needed

// Convert prices and volumes to `u128` for contract submission
let bid_price = bid_price as u128;
let ask_price = ask_price as u128;

// Prepare the transaction data for submitting to the contract
let tx_data = [
    ethabi::short_signature("submitOrderbookData", &[
        ethabi::ParamType::Uint(128),
        ethabi::ParamType::Uint(128),
        ethabi::ParamType::Uint(128),
        ethabi::ParamType::Uint(128),
    ])
    .to_vec(),
    ethabi::encode(&[
        ethabi::Token::Uint(bid_price.into()),
        ethabi::Token::Uint(bid_volume.into()),
        ethabi::Token::Uint(ask_price.into()),
        ethabi::Token::Uint(ask_volume.into()),
    ]),
]
.concat();

let mut tx = self.new_transaction(
    "evm.Call",
    module_evm::types::Call {
        address: ORACLE_CONTRACT_ADDRESS.parse().unwrap(),
        value: 0.into(),
        data: tx_data,
    },
);

tx.set_fee_gas(3_000_000);
env.client().sign_and_submit_tx(env.signer(), tx).await?;



        Ok(())
    }

}

fn main() {
    OracleApp.start();
}
//sudo docker run -it -p8545:8545 -p8546:8546 -v ./rofl-oracle:/rofls ghcr.io/oasisprotocol/sapphire-localnet
//oasis rofl build sgx --mode unsafe
//   npx hardhat compile
//    export PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
//  npx hardhat deploy rofl1qqn9xndja7e2pnxhttktmecvwzz0yqwxsquqyxdf --network sapphire-localnet
