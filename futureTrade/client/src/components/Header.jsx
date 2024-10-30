import React, { useState, useEffect } from 'react';
import web3 from '../backend/contracts/web3';
import futures from '../backend/contracts/futures';

const Header = () => {
  const [marketPrice, setMarketPrice] = useState("0.00");

  const fetchMarketPrice = async () => {
    try {
      const response = await futures.methods.currentMarketPrice().call();
      const mp = Number(response) / 1_000_000; // Convert to fractional
      setMarketPrice(mp.toFixed(2)); // Keep 2 decimal places
    } catch (error) {
      console.error("Error fetching market price:", error);
    }
  };

  useEffect(() => {
    // Fetch data repeatedly every 1 second
    const interval = setInterval(() => {
      fetchMarketPrice();
    }, 200); // Call every 0.2sec
    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []);

  return (
    <nav className="bg-gradient-to-r from-gray-800 to-gray-900 h-28 w-full flex items-center justify-center px-10 shadow-2xl rounded-xl mb-10">
      <div className="flex space-x-12 text-center">
        <div className="text-white flex flex-col items-center">
          <h1 className="text-sm font-semibold uppercase tracking-widest text-gray-400">Mark Price</h1>
          <span className="text-3xl font-extrabold text-green-500 animate-pulse">${marketPrice}</span>
        </div>
        <div className="text-white flex flex-col items-center">
          <h1 className="text-sm font-semibold uppercase tracking-widest text-gray-400">Index Price</h1>
          <span className="text-3xl font-extrabold text-blue-500 animate-pulse">$2745.21</span>
        </div>
        <div className="text-white flex flex-col items-center">
          <h1 className="text-sm font-semibold uppercase tracking-widest text-gray-400">24h Changes</h1>
          <span className="text-3xl font-extrabold text-red-500 animate-bounce">-2.45%</span>
        </div>
        <div className="text-white flex flex-col items-center">
          <h1 className="text-sm font-semibold uppercase tracking-widest text-gray-400">24h Volume</h1>
          <span className="text-3xl font-extrabold text-yellow-500 animate-pulse">$500M</span>
        </div>
      </div>
    </nav>
  );
};

export default Header;