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
  const [openPositions, setOpenPositions] = useState([]);
  const [closedPositions, setClosedPositions] = useState([]);
  const handleAddNetwork = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: '0x5afd', // Replace with the desired chain ID
            chainName: 'Sapphire Local Testnet', // Replace with your desired network name
            rpcUrls: ['http://localhost:8545'], // Replace with your network RPC URL
            nativeCurrency: {
              name: 'TEST',
              symbol: 'TEST',
              decimals: 18
            },
            blockExplorerUrls: ['http://localhost:80']
          }
        ]
      });
    } catch (error) {
      console.error("Failed to add network:", error);
    }
  };

  const handleConnectWallet = async () => {
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      alert("Wallet connected");
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  };
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
  const fetchPositions = async () => {
    try {
      const accounts = await web3.eth.getAccounts();
      if (!accounts.length) {
        console.error("No accounts found. Please connect your wallet.");
        return;
      }
      const userAddress = accounts[0];
      // Fetch Open Positions Count and Details
      const openPosCount = Number(await futures.methods.positionsCount(userAddress, 0).call()); // Ensure it's a number
      console.log("Open Positions Count:", openPosCount);

      let openPosArray = [];
      for (let i = 0; i < openPosCount; i++) {
        const pos = await futures.methods.openPositions(userAddress, i).call();
        const pnl = await futures.methods.calculatePnL(userAddress, i).call();
        // console.log(pos);
        // console.log(pnl);
        openPosArray.push({
          leverage: Number(pos[0]), // Convert BigInt to Number
          entryPrice: (Number(pos[1]) / 1_000_000).toFixed(2), // Convert and format price
          tokenUnits: Number(pos[2]),
          collateral: Number(pos[3]),
          timestamp: new Date(Number(pos[4]) * 1000).toLocaleString(), // Convert to readable date
          isBuy: pos[5],
          pnl: Number(pnl) / 1_000_000
        });
      }
      //console.log("Open Positions:", openPosArray);
      setOpenPositions(openPosArray);

      // Fetch Closed Positions Count and Details
      const closedPosCount = Number(await futures.methods.positionsCount(userAddress, 1).call()); // Ensure it's a number
      console.log("Closed Positions Count:", closedPosCount);

      let closedPosArray = [];

      for (let i = 0; i < closedPosCount; i++) {
        const pos = await futures.methods.settledPositions(userAddress, i).call();
        console.log(pos)
        const pnl = await futures.methods.pnlHistory(userAddress, i).call();
        console.log(pnl)
        closedPosArray.push({
          leverage: Number(pos[0]),
          entryPrice: (Number(pos[1]) / 1_000_000).toFixed(2),
          tokenUnits: Number(pos[2]),
          collateral: Number(pos[3]),
          timestamp: new Date(Number(pos[4]) * 1000).toLocaleString(),
          isBuy: pos[5],
          pnl: Number(pnl) / 1_000_000
        });
      }
      //console.log("Closed Positions:", closedPosArray);
      setClosedPositions(closedPosArray);
    } catch (error) {
      console.error("Error fetching positions:", error);
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
          gasPrice: web3.utils.toWei("150","gwei"),  // do 150 gwei for fast testing
          gas : 300000

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
            gasPrice: web3.utils.toWei("150","gwei"),  // do 150 gwei for fast testing
            gas : 300000  // Ensure backward compatibility
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
      fetchPositions();
    }, 1000);

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="App">
       <h1>Futures Market Dashboard</h1>
      <button onClick={handleConnectWallet}>Connect Wallet</button>
      <button onClick={handleAddNetwork}>Add Network</button>
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
      <div>
      <h2>Live Trades (Open Positions)</h2>
      <table border="1">
        <thead>
          <tr>
            <th>Leverage</th>
            <th>Entry Price</th>
            <th>Token Units</th>
            <th>Collateral</th>
            <th>Timestamp</th>
            <th>PNL</th>
            <th>Type</th>
          </tr>
        </thead>
        <tbody>
          {openPositions.map((position, index) => (
            <tr key={index}>
             <td>{position.leverage}</td>
              <td>{position.entryPrice}</td>
              <td>{position.tokenUnits}</td>
              <td>{position.collateral}</td>
              <td>{position.timestamp}</td>
              <td>{position.pnl}</td>
              <td>{position.isBuy ? "Buy" : "Sell"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Closed Trades (Settled Positions)</h2>
      <table border="1">
        <thead>
          <tr>
            <th>Leverage</th>
            <th>Entry Price</th>
            <th>Token Units</th>
            <th>Collateral</th>
            <th>Timestamp</th>
            <th>PNL</th>
            <th>Type</th>
          </tr>
        </thead>
        <tbody>
          {closedPositions.map((position, index) => (
            <tr key={index}>
              <td>{position.leverage}</td>
              <td>{position.entryPrice}</td>
              <td>{position.tokenUnits}</td>
              <td>{position.collateral}</td>
              <td>{position.timestamp}</td>
              <td>{position.pnl}</td>
              <td>{position.isBuy ? "Buy" : "Sell"}</td>
            </tr>
          ))}
        </tbody>
      </table>
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
