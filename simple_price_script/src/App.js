import React, { useEffect, useState } from "react";
import futures from "./components/contracts/futures";
import "./App.css";
import web3 from "./components/contracts/web3";

const App = () => {
  const [marketPrice, setMarketPrice] = useState("0.00");
  const [dailyHigh, setDailyHigh] = useState("0.00");
  const [dailyLow, setDailyLow] = useState("0.00");
  const [indexPrice, setIndexPrice] = useState("0.00");
  const [dailyExchangeVolume, setDailyExchangeVolume] = useState("0.00");
  const [ohlcvHistory, setOhlcvHistory] = useState([]);
  const [orderbook, setOrderbook] = useState([]);
  const [leverage, setLeverage] = useState(1);
  const [tokenAmount, setTokenAmount] = useState(0);
  const [isBuy, setIsBuy] = useState(true); // true for Buy, false for Sell
  const [positionIndex, setPositionIndex] = useState(0);

  // Function to fetch the current market parameters
  const fetchMarketParams = async () => {
    try {
      const price = await futures.methods.currentMarketPrice().call();
      const high = await futures.methods.dailyHigh().call();
      const low = await futures.methods.dailyLow().call();
      const volume = await futures.methods.dailyExchangeVolume().call();
      const index = await futures.methods.indexPrice().call();

      setMarketPrice((Number(price) / 1_000_000).toFixed(2));
      setDailyHigh((Number(high) / 1_000_000).toFixed(2));
      setDailyLow((Number(low) / 1_000_000).toFixed(2));
      setDailyExchangeVolume(Number(volume)/1_000_000);
      setIndexPrice((Number(index) / 1_000_000).toFixed(2));
    } catch (error) {
      console.error("Error fetching market parameters:", error);
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

  // Function to fetch the order book history
  const fetchOrderbookHistory = async () => {
    try {
      const orderbookData = await futures.methods.getOrderbookHistory().call();
      setOrderbook(orderbookData);
    } catch (error) {
      console.error("Error fetching order book history:", error);
    }
  };
  const handleOpenPosition = async () => {
    try {
      const accounts = await web3.eth.getAccounts();
      if (!accounts.length) {
        alert("No accounts found. Please connect your wallet.");
        return;
      }
      await futures.methods
        .openPosition(leverage, tokenAmount, isBuy)
        .send({
          from: accounts[0],
          gasPrice: await web3.eth.getGasPrice()  // Ensure backward compatibility
        });
      alert(`${isBuy ? "Buy" : "Sell"} position opened successfully!`);
    } catch (error) {
      console.error("Error opening position:", error);
    }
  };


    // Close position
    const handleClosePosition = async () => {
      try {
        const accounts = await web3.eth.getAccounts();
        await futures.methods
          .closePosition(positionIndex)
          .send({
            from: accounts[0],
            gasPrice: await web3.eth.getGasPrice()  // Ensure backward compatibility
          });
        alert("Position closed successfully!");
      } catch (error) {
        console.error("Error closing position:", error);
      }
    };

  useEffect(() => {
    // Fetch data periodically
    const interval = setInterval(() => {
      fetchMarketParams();
      fetchOHLCVHistory();
      fetchOrderbookHistory();
    }, 1000);

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="App">
      <h1>Futures Market Dashboard</h1>
      <p>Current Market Price: {marketPrice}</p>
      <p>Daily High: {dailyHigh}</p>
      <p>Daily Low: {dailyLow}</p>
      <p>Daily Exchange Volume: {dailyExchangeVolume}</p>
      <p>Index Price: {indexPrice}</p>

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

      <h2>Order Book</h2>
      <table border="1">
        <thead>
          <tr>
            <th>Block Number</th>
            <th>Bid Price</th>
            <th>Bid Volume</th>
            <th>Ask Price</th>
            <th>Ask Volume</th>
          </tr>
        </thead>
        <tbody>
          {orderbook.map((entry, index) => (
            <tr key={index}>
              <td>{Number(entry.blockNumber)}</td>
              <td>{Number(entry.bidPrice) / 1_000_000}</td>
              <td>{Number(entry.bidVolume)}</td>
              <td>{Number(entry.askPrice) / 1_000_000}</td>
              <td>{Number(entry.askVolume)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div>
        <h2>Trade Position</h2>
        <label>
          Leverage:
          <input type="number" value={leverage} onChange={(e) => setLeverage(Number(e.target.value))} min="1" max="100" />
        </label>
        <label>
          Token Amount:
          <input type="number" value={tokenAmount} onChange={(e) => setTokenAmount(Number(e.target.value))} />
        </label>
        <label>
          Position Type:
          <select onChange={(e) => setIsBuy(e.target.value === "buy")}>
            <option value="buy">Buy</option>
            <option value="sell">Sell</option>
          </select>
        </label>
        <button onClick={handleOpenPosition}>Open Position</button>
      </div>

      <div>
        <h2>Close Position</h2>
        <label>
          Position Index:
          <input type="number" value={positionIndex} onChange={(e) => setPositionIndex(Number(e.target.value))} />
        </label>
        <button onClick={handleClosePosition}>Close Position</button>
      </div>
    </div>
  );
};

export default App;



// import React, { useEffect, useState } from "react";
// import futures from "./components/contracts/futures";
// import "./App.css";
// import web3 from "./components/contracts/web3";

// const App = () => {
//   const [marketPrice, setMarketPrice] = useState("0.00");
//   const [ohlcvHistory, setOhlcvHistory] = useState([]);

//   // Function to fetch the current market price
//   const fetchMarketPrice = async () => {
//     try {
//       const response = await futures.methods.currentMarketPrice().call();
//       const mp = Number(response) / 1_000_000; // Convert to fractional
//       setMarketPrice(mp.toFixed(2)); // Keep 2 decimal places
//     } catch (error) {
//       console.error("Error fetching market price:", error);
//     }
//   };

//   // Function to fetch the OHLCV history
//   const fetchOHLCVHistory = async () => {
//     try {
//       const ohlcvData = await futures.methods.getOHLCVHistory().call();
//       setOhlcvHistory(ohlcvData);
//     } catch (error) {
//       console.error("Error fetching OHLCV history:", error);
//     }
//   };

//   useEffect(() => {
//     // Fetch data repeatedly every 1 second
//     const interval = setInterval(() => {
//       fetchMarketPrice();
//       fetchOHLCVHistory();
//     }, 200); // Call every 1 second

//     // Cleanup interval on component unmount
//     return () => clearInterval(interval);
//   }, []); // Empty dependency array ensures it runs once on mount

//   return (
//     <div className="App">
//       <h1>Futures Market Dashboard</h1>
//       <p>Current Market Price: {marketPrice}</p>

//       <h2>OHLCV History</h2>
//       <table border="1">
//         <thead>
//           <tr>
//             <th>Block Number</th>
//             <th>Open</th>
//             <th>High</th>
//             <th>Low</th>
//             <th>Close</th>
//             <th>Volume</th>
//           </tr>
//         </thead>
//         <tbody>
//           {ohlcvHistory.map((entry, index) => (
//             <tr key={index}>
//               <td>{Number(entry.blockNumber)}</td>
//               <td>{Number(entry.open) / 1_000_000}</td>
//               <td>{Number(entry.high) / 1_000_000}</td>
//               <td>{Number(entry.low) / 1_000_000}</td>
//               <td>{Number(entry.close) / 1_000_000}</td>
//               <td>{Number(entry.volume)}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default App;
