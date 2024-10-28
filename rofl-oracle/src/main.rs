use oasis_runtime_sdk::modules::rofl::app::prelude::*;
use std::sync::Arc;
use tokio::time::{self, Duration};
use serde_json::Value;
use anyhow::Result;

/// Address where the oracle contract is deployed.
// #region oracle-contract-address
const ORACLE_CONTRACT_ADDRESS: &str = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // TODO: Replace with your contract address.

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
                .get("https://min-api.cryptocompare.com/data/v2/histominute?fsym=ETH&tsym=USD&limit=10&api_key=YOUR_API_KEY")
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
                tx.set_fee_gas(200_000);

                env.client().sign_and_submit_tx(env.signer(), tx).await?;

             time::sleep(Duration::from_secs(10)).await;

             // Fetch market price data for Bitcoin.
        let market_price_response: Value = rofl_utils::https::agent()
            .get("https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD")
            .call()?
            .body_mut()
            .read_json()?;

        let market_price = (market_price_response["USD"]
            .as_f64()
            .unwrap_or_default()
            * 1_000_000.0) as u128;

        // Prepare and submit the market price observation to the Oracle contract.
        let mp_tx_data = [
            ethabi::short_signature("submitMarketPriceObservation", &[
                ethabi::ParamType::Uint(128),
            ])
            .to_vec(),
            ethabi::encode(&[ethabi::Token::Uint(market_price.into())]),
        ]
        .concat();

        let mut mp_tx = self.new_transaction(
            "evm.Call",
            module_evm::types::Call {
                address: ORACLE_CONTRACT_ADDRESS.parse().unwrap(),
                value: 0.into(),
                data: mp_tx_data,
            },
        );
        mp_tx.set_fee_gas(200_000);
        env.client().sign_and_submit_tx(env.signer(), mp_tx).await?;

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
//