// import React, { useState } from 'react';

// const BuySell = () => {
//   const [leverage, setLeverage] = useState(1);
//   const [size, setSize] = useState(0);
//   const [selectedAction, setSelectedAction] = useState("Buy");

//   const handleExecute = () => {
//     console.log(`${selectedAction} futures with leverage: ${leverage}, size: ${size}`);
//   };

//   return (
//     <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 p-8 flex flex-col text-white rounded-lg shadow-2xl space-y-8">
//       <h2 className="text-2xl font-bold mb-4 text-center">Buy/Sell Futures</h2>

//       <div className="flex justify-center space-x-4 mb-6">
//         <button
//           onClick={() => setSelectedAction("Buy")}
//           className={`px-6 py-2 rounded-full font-bold transition-all border-2 ${
//             selectedAction === "Buy" ? "border-green-500 text-white" : "border-green-300 text-green-800"
//           }`}
//         >
//           Buy
//         </button>
//         <button
//           onClick={() => setSelectedAction("Sell")}
//           className={`px-6 py-2 rounded-full font-bold transition-all border-2 ${
//             selectedAction === "Sell" ? "border-red-500 text-white" : "border-red-300 text-red-800"
//           }`}
//         >
//           Sell
//         </button>
//       </div>

//       <div className="mb-6">
//         <label className="block text-sm font-medium mb-2" htmlFor="leverage">
//           Leverage: <span className="font-bold">{leverage}x</span>
//         </label>
//         <input
//           type="range"
//           id="leverage"
//           value={leverage}
//           onChange={(e) => setLeverage(e.target.value)}
//           min="1"
//           max="100"
//           className="w-full h-2 bg-blue-500 rounded-lg cursor-pointer transition-all accent-blue-600"
//         />
//       </div>

//       <div className="mb-6">
//         <label className="block text-sm font-medium mb-2" htmlFor="size">
//           Size: <span className="font-bold">{size}</span> units
//         </label>
//         <input
//           type="range"
//           id="size"
//           value={size}
//           onChange={(e) => setSize(e.target.value)}
//           min="0"
//           max="1000"
//           step="1"
//           className="w-full h-2 bg-green-500 rounded-lg cursor-pointer transition-all accent-green-600"
//         />
//       </div>

//       <button
//         onClick={handleExecute}
//         className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white font-bold py-3 px-4 rounded-lg transition-transform transform hover:scale-105 animate-gradient"
//         style={{
//           backgroundSize: '200% 200%',
//           animation: 'gradient-animation 3s ease infinite'
//         }}
//       >
//         Execute {selectedAction}
//       </button>

//       <style jsx>{`
//         @keyframes gradient-animation {
//           0% {
//             background-position: 0% 50%;
//           }
//           50% {
//             background-position: 100% 50%;
//           }
//           100% {
//             background-position: 0% 50%;
//           }
//         }
//       `}</style>
//     </div>
//   );
// };

// export default BuySell;

import React, { useState } from 'react';
import web3 from '../backend/contracts/web3';
import futures from '../backend/contracts/futures';

const BuySell = () => {
  const [leverage, setLeverage] = useState(1);
  const [tokenAmount, setTokenAmount] = useState(0);
  const [selectedAction, setSelectedAction] = useState("Buy");
  const [loading, setLoading] = useState(false);

  const handleExecute = async () => {
    try {
      setLoading(true);
      const accounts = await web3.eth.getAccounts();
      if (!accounts.length) {
        alert("No accounts found. Please connect your wallet.");
        return;
      }

      await futures.methods
        .openPosition(leverage, tokenAmount, selectedAction === "Buy")
        .send({
          from: accounts[0],
          gasPrice: web3.utils.toWei("150","gwei"),  // do 150 gwei for fast testing
          gas : 300000

        });

      alert(`${selectedAction} position opened successfully!`);
    } catch (error) {
      console.error("Error executing trade:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 p-8 flex flex-col text-white rounded-lg shadow-2xl space-y-8">
      <h2 className="text-2xl font-bold mb-4 text-center">Buy/Sell Futures</h2>

      <div className="flex justify-center space-x-4 mb-6">
        <button
          onClick={() => setSelectedAction("Buy")}
          className={`px-6 py-2 rounded-full font-bold transition-all border-2 ${
            selectedAction === "Buy"
              ? "border-green-500 text-white bg-green-500/20"
              : "border-green-300 text-green-300"
          }`}
        >
          Buy
        </button>
        <button
          onClick={() => setSelectedAction("Sell")}
          className={`px-6 py-2 rounded-full font-bold transition-all border-2 ${
            selectedAction === "Sell"
              ? "border-red-500 text-white bg-red-500/20"
              : "border-red-300 text-red-300"
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
          onChange={(e) => setLeverage(parseInt(e.target.value))}
          min="1"
          max="100"
          className="w-full h-2 bg-blue-500 rounded-lg cursor-pointer transition-all accent-blue-600"
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-2" htmlFor="tokenAmount">
          Token Amount: <span className="font-bold">{tokenAmount}</span>
        </label>
        <input
          type="range"
          id="tokenAmount"
          value={tokenAmount}
          onChange={(e) => setTokenAmount(parseInt(e.target.value))}
          min="0"
          max="1000"
          step="1"
          className="w-full h-2 bg-green-500 rounded-lg cursor-pointer transition-all accent-green-600"
        />
      </div>

      <button
        onClick={handleExecute}
        disabled={loading}
        className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white font-bold py-3 px-4 rounded-lg transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Processing..." : `Execute ${selectedAction}`}
      </button>
    </div>
  );
};

export default BuySell;