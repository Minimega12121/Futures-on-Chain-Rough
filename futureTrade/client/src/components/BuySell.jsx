import React, { useState } from 'react';

const BuySell = () => {
  const [leverage, setLeverage] = useState(1);
  const [size, setSize] = useState(0);
  const [selectedAction, setSelectedAction] = useState("Buy");

  const handleExecute = () => {
    console.log(`${selectedAction} futures with leverage: ${leverage}, size: ${size}`);
  };

  return (
    <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 p-8 flex flex-col text-white rounded-lg shadow-2xl space-y-8">
      <h2 className="text-2xl font-bold mb-4 text-center">Buy/Sell Futures</h2>

      <div className="flex justify-center space-x-4 mb-6">
        <button
          onClick={() => setSelectedAction("Buy")}
          className={`px-6 py-2 rounded-full font-bold transition-all border-2 ${
            selectedAction === "Buy" ? "border-green-500 text-white" : "border-green-300 text-green-800"
          }`}
        >
          Buy
        </button>
        <button
          onClick={() => setSelectedAction("Sell")}
          className={`px-6 py-2 rounded-full font-bold transition-all border-2 ${
            selectedAction === "Sell" ? "border-red-500 text-white" : "border-red-300 text-red-800"
          }`}
        >
          Sell
        </button>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-2" htmlFor="leverage">
          Leverage: <span className="font-bold">{leverage}x</span>
        </label>
        <input
          type="range"
          id="leverage"
          value={leverage}
          onChange={(e) => setLeverage(e.target.value)}
          min="1"
          max="100"
          className="w-full h-2 bg-blue-500 rounded-lg cursor-pointer transition-all accent-blue-600"
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-2" htmlFor="size">
          Size: <span className="font-bold">{size}</span> units
        </label>
        <input
          type="range"
          id="size"
          value={size}
          onChange={(e) => setSize(e.target.value)}
          min="0"
          max="1000"
          step="1"
          className="w-full h-2 bg-green-500 rounded-lg cursor-pointer transition-all accent-green-600"
        />
      </div>

      <button
        onClick={handleExecute}
        className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white font-bold py-3 px-4 rounded-lg transition-transform transform hover:scale-105 animate-gradient"
        style={{
          backgroundSize: '200% 200%',
          animation: 'gradient-animation 3s ease infinite'
        }}
      >
        Execute {selectedAction}
      </button>

      <style jsx>{`
        @keyframes gradient-animation {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>
    </div>
  );
};

export default BuySell;