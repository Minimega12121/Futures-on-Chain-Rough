// import React, { useState, useEffect } from 'react';
// import futures from '../backend/contracts/futures';

// const Header = () => {
//   const [marketPrice, setMarketPrice] = useState("0.00");
//   const [dailyHigh, setDailyHigh] = useState("0.00");
//   const [dailyLow, setDailyLow] = useState("0.00");
//   const [indexPrice, setIndexPrice] = useState("0.00");
//   const fetchMarketData = async () => {
//     try {
//       const marketPrice = await futures.methods.currentMarketPrice().call();
//       const high = await futures.methods.dailyHigh().call();
//       const low = await futures.methods.dailyLow().call();
//       const index = await futures.methods.indexPrice().call();

//       setMarketPrice((Number(marketPrice) / 1_000_000).toFixed(2));
//       setDailyHigh((Number(high) / 1_000_000).toFixed(2));
//       setDailyLow((Number(low) / 1_000_000).toFixed(2));
//       setIndexPrice((Number(index) / 1_000_000).toFixed(2));
//     } catch (error) {
//       console.error("Error fetching market data:", error);
//     }
//   };

//   useEffect(() => {
//     const interval = setInterval(() => {
//       fetchMarketData();
//     }, 200);

//     return () => clearInterval(interval);
//   }, []);

//   return (
//     <nav className="bg-gradient-to-r from-gray-800 to-gray-900 h-28 w-full flex items-center justify-center px-10 shadow-2xl rounded-xl mb-10">
//       <div className="flex space-x-12 text-center">
//         <div className="text-white flex flex-col items-center">
//           <h1 className="text-sm font-semibold uppercase tracking-widest text-gray-400">Market Price</h1>
//           <span className="text-3xl font-extrabold text-green-500 animate-pulse">${marketPrice}</span>
//         </div>
//         <div className="text-white flex flex-col items-center">
//           <h1 className="text-sm font-semibold uppercase tracking-widest text-gray-400">Daily High</h1>
//           <span className="text-3xl font-extrabold text-blue-500 animate-pulse">${dailyHigh}</span>
//         </div>
//         <div className="text-white flex flex-col items-center">
//           <h1 className="text-sm font-semibold uppercase tracking-widest text-gray-400">Daily Low</h1>
//           <span className="text-3xl font-extrabold text-red-500 animate-bounce">${dailyLow}</span>
//         </div>
//         <div className="text-white flex flex-col items-center">
//           <h1 className="text-sm font-semibold uppercase tracking-widest text-gray-400">Index Price</h1>
//           <span className="text-3xl font-extrabold text-yellow-500 animate-pulse">${indexPrice}</span>
//         </div>
//       </div>
//     </nav>
//   );
// };

// export default Header;

import React, { useState, useEffect, useCallback } from 'react';
import futures from '../backend/contracts/futures';
import { TrendingUp, TrendingDown, Activity, ArrowUp, ArrowDown } from 'lucide-react';

const Header = () => {
  const [marketPrice, setMarketPrice] = useState("0.00");
  const [previousPrice, setPreviousPrice] = useState("0.00");
  const [dailyHigh, setDailyHigh] = useState("0.00");
  const [dailyLow, setDailyLow] = useState("0.00");
  const [indexPrice, setIndexPrice] = useState("0.00");
  const [priceDirection, setPriceDirection] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMarketData = useCallback(async () => {
    try {
      const marketPrice = await futures.methods.currentMarketPrice().call();
      const high = await futures.methods.dailyHigh().call();
      const low = await futures.methods.dailyLow().call();
      const index = await futures.methods.indexPrice().call();

      const newMarketPrice = (Number(marketPrice) / 1_000_000).toFixed(2);

      if (Number(newMarketPrice) > Number(marketPrice)) {
        setPriceDirection('up');
      } else if (Number(newMarketPrice) < Number(marketPrice)) {
        setPriceDirection('down');
      }

      setPreviousPrice(marketPrice);
      setMarketPrice(newMarketPrice);
      setDailyHigh((Number(high) / 1_000_000).toFixed(2));
      setDailyLow((Number(low) / 1_000_000).toFixed(2));
      setIndexPrice((Number(index) / 1_000_000).toFixed(2));
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching market data:", error);
      setIsLoading(false);
    }
  }, [marketPrice]);

  useEffect(() => {
    fetchMarketData();
    const interval = setInterval(fetchMarketData, 1000);
    return () => clearInterval(interval);
  }, [fetchMarketData]);

  useEffect(() => {
    if (priceDirection) {
      const timer = setTimeout(() => {
        setPriceDirection(null);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [priceDirection]);

  const getMarketPriceColor = () => {
    if (priceDirection === 'up') return 'text-green-500';
    if (priceDirection === 'down') return 'text-red-500';
    return 'text-white';
  };

  const PriceCard = ({ title, value, icon: Icon, color, animation }) => (
    <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-gray-700 hover:border-gray-600 transition-all duration-300 min-w-[200px]">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">{title}</h2>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <div className={`text-3xl font-bold ${color} ${animation}`}>
        ${value}
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 h-28 w-full flex items-center justify-center px-10 shadow-2xl rounded-xl mb-10">
        <Activity className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <nav className="bg-gradient-to-r from-gray-800/95 to-gray-900/95 backdrop-blur-lg p-8 w-full rounded-xl mb-10 shadow-2xl border border-gray-700 mt-4">
      <div className="flex items-center justify-between space-x-6">
        <PriceCard
          title="Market Price"
          value={marketPrice}
          icon={priceDirection === 'up' ? TrendingUp : TrendingDown}
          color={getMarketPriceColor()}
          animation={priceDirection === 'up' ? 'animate-bounce-short' : priceDirection === 'down' ? 'animate-bounce-down' : ''}
        />

        <PriceCard
          title="Daily High"
          value={dailyHigh}
          icon={ArrowUp}
          color="text-blue-500"
          animation="hover:scale-105"
        />

        <PriceCard
          title="Daily Low"
          value={dailyLow}
          icon={ArrowDown}
          color="text-red-500"
          animation="hover:scale-105"
        />

        <PriceCard
          title="Index Price"
          value={indexPrice}
          icon={Activity}
          color="text-yellow-500"
          animation="hover:scale-105"
        />
      </div>

      <style jsx>{`
        @keyframes bounceShort {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes bounceDown {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(10px); }
        }
        .animate-bounce-short {
          animation: bounceShort 1s ease-in-out;
        }
        .animate-bounce-down {
          animation: bounceDown 1s ease-in-out;
        }
      `}</style>
    </nav>
  );
};

export default Header;