import React, { useEffect, useState } from "react";
import futures from "./components/contracts/futures";
import "./App.css";
import web3 from "./components/contracts/web3";

const App = () => {
  const [marketPrice, setMarketPrice] = useState("0.00");
  const [ohlcvHistory, setOhlcvHistory] = useState([]);

  // Function to fetch the current market price
  const fetchMarketPrice = async () => {
    try {
      const response = await futures.methods.currentMarketPrice().call();
      const mp = Number(response) / 1_000_000; // Convert to fractional
      setMarketPrice(mp.toFixed(2)); // Keep 2 decimal places
    } catch (error) {
      console.error("Error fetching market price:", error);
    }
  };

  // Function to fetch the OHLCV history
  const fetchOHLCVHistory = async () => {
    try {
      const ohlcvData = await futures.methods.getOHLCVHistory().call();
      setOhlcvHistory(ohlcvData);
    } catch (error) {
      console.error("Error fetching OHLCV history:", error);
    }
  };

  useEffect(() => {
    // Fetch data repeatedly every 1 second
    const interval = setInterval(() => {
      fetchMarketPrice();
      fetchOHLCVHistory();
    }, 200); // Call every 1 second

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []); // Empty dependency array ensures it runs once on mount

  return (
    <div className="App">
      <h1>Futures Market Dashboard</h1>
      <p>Current Market Price: {marketPrice}</p>

      <h2>OHLCV History</h2>
      <table border="1">
        <thead>
          <tr>
            <th>Block Number</th>
            <th>Open</th>
            <th>High</th>
            <th>Low</th>
            <th>Close</th>
            <th>Volume</th>
          </tr>
        </thead>
        <tbody>
          {ohlcvHistory.map((entry, index) => (
            <tr key={index}>
              <td>{Number(entry.blockNumber)}</td>
              <td>{Number(entry.open) / 1_000_000}</td>
              <td>{Number(entry.high) / 1_000_000}</td>
              <td>{Number(entry.low) / 1_000_000}</td>
              <td>{Number(entry.close) / 1_000_000}</td>
              <td>{Number(entry.volume)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default App;
