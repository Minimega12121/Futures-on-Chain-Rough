import React from 'react';
import Navbar from "./components/Navbar";
import Graph from "./components/Graph";
import BuySell from "./components/BuySell";
import Header from './components/Header';
import History from './components/History';
import Orderbook from './components/OrderBook';

function App() {
  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <Navbar />
      <Header />
      <div className="flex flex-grow flex-col lg:flex-row h-[calc(100vh-128px)] p-4 space-y-4 lg:space-y-0 lg:space-x-4 overflow-y-auto">
        <div className="lg:w-7/12 flex flex-col space-y-4">
          <Graph />
        </div>
        <div className="lg:w-1/4 w-full lg:flex lg:flex-col space-y-4 lg:space-y-0">
          <Orderbook />
        </div>
        <div className="lg:w-1/4 w-full lg:flex lg:flex-col space-y-4 lg:space-y-0">
          <BuySell />
        </div>
      </div>
      <History />
    </div>
  );
}

export default App;