use std::process::Command;
use std::fs;
use serde_json::Value;
use std::error::Error;

fn getsignal(ohlcv_signal: &[f64]) -> Result<i32, Box<dyn Error>> {
    let args: Vec<String> = ohlcv_signal.iter().map(|x| x.to_string()).collect();

    // Call the Python script using `Command` with piped arguments
    let output = Command::new("python3")
        .arg("./predict_signal.py")
        .args(&args)
        .output()?;

    // Check if the command was successful
    if !output.status.success() {
        eprintln!("Error: Python script did not run successfully");
        return Err(Box::from("Python script execution failed"));
    }

    // Read the signal from the JSON output file
    let json_data = fs::read_to_string("./signal_output.json")?;
    let parsed_json: Value = serde_json::from_str(&json_data)?;
    let signal = parsed_json["signal"].as_str().unwrap_or("Unknown").to_string();

    // Return appropriate integer signal values
    if signal == "Buy" {
        return Ok(1);
    } else if signal == "Sell" {
        return Ok(-1);
    } else {
        return Ok(0); // neutral
    }
}

fn main() -> Result<(), Box<dyn Error>> {
    // Sample OHLCV data to pass to Python script (replace with actual data)
    let ohlcv_data = [
        150.0, 155.0, 148.0, 152.0, 1000000.0,
        152.0, 158.0, 151.0, 156.0, 1200000.0,
        156.0, 160.0, 155.0, 158.0, 1100000.0,
        158.0, 162.0, 157.0, 161.0, 1300000.0,
        161.0, 165.0, 160.0, 164.0, 1400000.0,
    ];

    let signal = getsignal(&ohlcv_data)?;
    println!("Signal: {}", signal);

    Ok(())
}
