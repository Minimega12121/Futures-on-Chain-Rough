// import React from 'react';
// import web3 from '../backend/contracts/web3';
// import futures from '../backend/contracts/futures';

// const Orderbook = () => {

//   const asks = Array.from({ length: 8 }, (_, i) => ({
//     price: 45000 + (i * 50),
//     size: Math.random() * 2,
//     total: 0
//   })).reverse();

//   const bids = Array.from({ length: 8 }, (_, i) => ({
//     price: 44950 - (i * 50),
//     size: Math.random() * 2,
//     total: 0
//   }));

//   // Calculate cumulative totals
//   asks.reduce((acc, ask, i) => {
//     ask.total = acc + ask.size;
//     return ask.total;
//   }, 0);

//   bids.reduce((acc, bid, i) => {
//     bid.total = acc + bid.size;
//     return bid.total;
//   }, 0);

//   const maxTotal = Math.max(
//     asks[asks.length - 1].total,
//     bids[bids.length - 1].total
//   );

//   return (
//     <div className="bg-gray-900 p-6 rounded-lg shadow-lg text-white h-full">
//       <h2 className="text-xl font-semibold mb-4">Orderbook</h2>

//       {/* Asks */}
//       <div className="space-y-1">
//         {asks.map((ask, i) => (
//           <div key={`ask-${i}`} className="flex items-center text-sm">
//             <div className="w-24 text-red-400">{ask.price.toFixed(1)}</div>
//             <div className="w-24 text-right">{ask.size.toFixed(3)}</div>
//             <div className="flex-grow relative h-5">
//               <div
//                 className="absolute right-0 top-0 h-full bg-red-900/30"
//                 style={{ width: `${(ask.total / maxTotal) * 100}%` }}
//               ></div>
//               <div className="absolute right-0 top-0 text-right pr-2">
//                 {ask.total.toFixed(3)}
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Spread */}
//       <div className="my-4 text-center text-sm text-gray-400">
//         Spread: {(asks[asks.length - 1].price - bids[0].price).toFixed(1)} ({((asks[asks.length - 1].price - bids[0].price) / asks[asks.length - 1].price * 100).toFixed(2)}%)
//       </div>

//       {/* Bids */}
//       <div className="space-y-1">
//         {bids.map((bid, i) => (
//           <div key={`bid-${i}`} className="flex items-center text-sm">
//             <div className="w-24 text-green-400">{bid.price.toFixed(1)}</div>
//             <div className="w-24 text-right">{bid.size.toFixed(3)}</div>
//             <div className="flex-grow relative h-5">
//               <div
//                 className="absolute right-0 top-0 h-full bg-green-900/30"
//                 style={{ width: `${(bid.total / maxTotal) * 100}%` }}
//               ></div>
//               <div className="absolute right-0 top-0 text-right pr-2">
//                 {bid.total.toFixed(3)}
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default Orderbook;

import React, { useState, useEffect } from 'react';
import futures from '../backend/contracts/futures';

const Orderbook = () => {
  const [orderbook, setOrderbook] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrderbook = async () => {
    try {
      const orderbookData = await futures.methods.getOrderbookHistory().call();
      const formattedData = orderbookData.map(entry => ({
        blockNumber: Number(entry.blockNumber),
        bidPrice: Number(entry.bidPrice) / 1_000_000,
        bidVolume: Number(entry.bidVolume) /1_000_000,
        askPrice: Number(entry.askPrice) / 1_000_000,
        askVolume: Number(entry.askVolume) / 1_000_000
      }));
      setOrderbook(formattedData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching orderbook:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderbook();
    const interval = setInterval(fetchOrderbook, 1000);
    return () => clearInterval(interval);
  }, []);

  // Group and aggregate similar prices
  const aggregateOrders = (orders, type) => {
    const aggregated = orders.reduce((acc, order) => {
      const price = type === 'ask' ? order.askPrice : order.bidPrice;
      const volume = type === 'ask' ? order.askVolume : order.bidVolume;

      if (!acc[price]) {
        acc[price] = { price, size: 0, total: 0 };
      }
      acc[price].size += volume;
      return acc;
    }, {});

    return Object.values(aggregated)
      .sort((a, b) => type === 'ask' ? b.price - a.price : b.price - a.price)
      .slice(0, 8);
  };

  const asks = aggregateOrders(orderbook, 'ask');
  const bids = aggregateOrders(orderbook, 'bid');

  // Calculate cumulative totals
  asks.reduce((acc, ask) => {
    ask.total = acc + ask.size;
    return ask.total;
  }, 0);

  bids.reduce((acc, bid) => {
    bid.total = acc + bid.size;
    return bid.total;
  }, 0);

  const maxTotal = Math.max(
    asks.length ? asks[asks.length - 1].total : 0,
    bids.length ? bids[bids.length - 1].total : 0
  );

  if (loading) {
    return (
      <div className="bg-gray-900 p-6 rounded-lg shadow-lg text-white h-full flex items-center justify-center">
        Loading orderbook...
      </div>
    );
  }

  return (
    <div className="bg-gray-900 p-6 rounded-lg shadow-lg text-white h-full">
      <h2 className="text-xl font-semibold mb-4">Orderbook</h2>

      {/* Asks */}
      <div className="space-y-1">
        {asks.map((ask, i) => (
          <div key={`ask-${i}`} className="flex items-center text-sm">
            <div className="w-24 text-red-400">{ask.price.toFixed(2)}</div>
            <div className="w-24 text-right">{ask.size.toFixed(3)}</div>
            <div className="flex-grow relative h-5">
              <div
                className="absolute right-0 top-0 h-full bg-red-900/30"
                style={{ width: `${(ask.total / maxTotal) * 100}%` }}
              ></div>
              <div className="absolute right-0 top-0 text-right pr-2">
                {ask.total.toFixed(3)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Spread */}
      {asks.length > 0 && bids.length > 0 && (
        <div className="my-4 text-center text-sm text-gray-400">
          Spread: {(asks[asks.length - 1].price - bids[0].price).toFixed(2)} (
          {((asks[asks.length - 1].price - bids[0].price) / asks[asks.length - 1].price * 100).toFixed(2)}%)
        </div>
      )}

      {/* Bids */}
      <div className="space-y-1">
        {bids.map((bid, i) => (
          <div key={`bid-${i}`} className="flex items-center text-sm">
            <div className="w-24 text-green-400">{bid.price.toFixed(2)}</div>
            <div className="w-24 text-right">{bid.size.toFixed(3)}</div>
            <div className="flex-grow relative h-5">
              <div
                className="absolute right-0 top-0 h-full bg-green-900/30"
                style={{ width: `${(bid.total / maxTotal) * 100}%` }}
              ></div>
              <div className="absolute right-0 top-0 text-right pr-2">
                {bid.total.toFixed(3)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orderbook;