use oasis_runtime_sdk::modules::rofl::app::prelude::*;
use std::sync::Arc;
use serde_json::Value;
use std::process::Command;
use std::fs;
use anyhow::{Context, Result};
use std::sync::{Mutex, RwLock};



/// Address where the oracle contract is deployed.
// #region oracle-contract-address
const ORACLE_CONTRACT_ADDRESS: &str = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"; // TODO: Replace with your contract address.

struct OracleApp {
    ohlcv_signals: Mutex<Vec<f64>>, // Updated type to store f64 signals
    model_signal: RwLock<Option<i128>>, // i128 to store the signal directly
}
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

    pub fn new() -> Self {
        Self {
            ohlcv_signals: Mutex::new(Vec::new()),
            model_signal: RwLock::new(None),
        }
    }
    
    // get the buy/sell signal from the lstm trading bot model by giving previous 5 ohlcv values as parameters
    fn getsignal(ohlcv_signal: &[f64]) -> Result<i128> {
        let args: Vec<String> = ohlcv_signal.iter().map(|x| x.to_string()).collect();
        let output = Command::new("python3")
            .arg("./predict_signal.py")
            .args(&args)
            .output()
            .context("Failed to execute Python script")?;

        if !output.status.success() {
            return Err(anyhow::anyhow!("Python script execution failed"));
        }

        let json_data = fs::read_to_string("./signal_output.json")
            .context("Failed to read JSON output from signal_output.json")?;
        let parsed_json: Value = serde_json::from_str(&json_data)
            .context("Failed to parse JSON data")?;

        let signal = parsed_json["signal"]
            .as_str()
            .context("Signal key missing or not a string")?;

        Ok(match signal {
            "Buy" => 1,
            "Sell" => -1,
            _ => 0,
        })
    }

    fn update_signals(&self, ohlcv_data: Vec<f64>) -> Result<()> {
        let mut signals = self.ohlcv_signals.lock().expect("Failed to lock ohlcv_signals");
        signals.extend(ohlcv_data);

        let recent_signals: Vec<f64> = signals.iter().rev().take(5).cloned().collect();
        let new_signal = Self::getsignal(&recent_signals)?;
        let mut model_signal = self.model_signal.write().expect("Failed to lock model_signal");
        *model_signal = Some(new_signal);

        signals.truncate(5);
        Ok(())
    }
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

// Currently taken as dummy values due to api restriction
let bid_volume = 1000000u128;
let ask_volume = 1000000u128;

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





let response: Value = rofl_utils::https::agent()
            .get("https://min-api.cryptocompare.com/data/v2/histominute?fsym=ETH&tsym=USD&limit=10&api_key=3df9cc83af512bebeb5f27bcd1f73556459b93e2fa410f748aa25d3e30213ccf&e=coinbase")
            .call()?
            .body_mut()
            .read_json()?;

        let data_points = response["Data"]["Data"]
            .as_array()
            .ok_or_else(|| anyhow::anyhow!("Data not found"))?;

        let mut ohlcv_data = Vec::new();
        for data in data_points.iter().take(5) {
            let open = data["open"].as_f64().unwrap_or(0.0);
            let high = data["high"].as_f64().unwrap_or(0.0);
            let low = data["low"].as_f64().unwrap_or(0.0);
            let close = data["close"].as_f64().unwrap_or(0.0);
            let volume = data["volumefrom"].as_f64().unwrap_or(0.0);

            ohlcv_data.push(open);
            ohlcv_data.push(high);
            ohlcv_data.push(low);
            ohlcv_data.push(close);
            ohlcv_data.push(volume);
        }

        self.update_signals(ohlcv_data)?;

        let signal_value = *self.model_signal.read().unwrap().as_ref().unwrap_or(&0);

        let tx_data = [
            ethabi::short_signature("updateModelSignal", &[ethabi::ParamType::Int(128)]).to_vec(),
            ethabi::encode(&[ethabi::Token::Int(signal_value.into())]),
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

        tx.set_fee_gas(1_000_000);
        env.client().sign_and_submit_tx(env.signer(), tx).await?;

        Ok(())
    }

}

fn main() {
    let app = OracleApp::new();
    app.start();
}
//sudo docker run -it -p8545:8545 -p8546:8546 -v ./rofl-oracle:/rofls ghcr.io/oasisprotocol/sapphire-localnet
//oasis rofl build sgx --mode unsafe
//   npx hardhat compile
//    export PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
//  npx hardhat deploy rofl1qqn9xndja7e2pnxhttktmecvwzz0yqwxsquqyxdf --network sapphire-localnet
