import React from 'react';
import web3 from '../backend/contracts/web3';
import futures from '../backend/contracts/futures';

const Orderbook = () => {

  const asks = Array.from({ length: 8 }, (_, i) => ({
    price: 45000 + (i * 50),
    size: Math.random() * 2,
    total: 0
  })).reverse();

  const bids = Array.from({ length: 8 }, (_, i) => ({
    price: 44950 - (i * 50),
    size: Math.random() * 2,
    total: 0
  }));

  // Calculate cumulative totals
  asks.reduce((acc, ask, i) => {
    ask.total = acc + ask.size;
    return ask.total;
  }, 0);

  bids.reduce((acc, bid, i) => {
    bid.total = acc + bid.size;
    return bid.total;
  }, 0);

  const maxTotal = Math.max(
    asks[asks.length - 1].total,
    bids[bids.length - 1].total
  );

  return (
    <div className="bg-gray-900 p-6 rounded-lg shadow-lg text-white h-full">
      <h2 className="text-xl font-semibold mb-4">Orderbook</h2>

      {/* Asks */}
      <div className="space-y-1">
        {asks.map((ask, i) => (
          <div key={`ask-${i}`} className="flex items-center text-sm">
            <div className="w-24 text-red-400">{ask.price.toFixed(1)}</div>
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
      <div className="my-4 text-center text-sm text-gray-400">
        Spread: {(asks[asks.length - 1].price - bids[0].price).toFixed(1)} ({((asks[asks.length - 1].price - bids[0].price) / asks[asks.length - 1].price * 100).toFixed(2)}%)
      </div>

      {/* Bids */}
      <div className="space-y-1">
        {bids.map((bid, i) => (
          <div key={`bid-${i}`} className="flex items-center text-sm">
            <div className="w-24 text-green-400">{bid.price.toFixed(1)}</div>
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