import React from 'react';

const dummyData = [
  { date: '2024-10-21', type: 'Buy', asset: 'BTC/USD', size: '1.5', leverage: '10x', profitLoss: '+$150' },
  { date: '2024-10-20', type: 'Sell', asset: 'ETH/USD', size: '2.0', leverage: '5x', profitLoss: '-$100' },
  { date: '2024-10-19', type: 'Buy', asset: 'SOL/USD', size: '3.0', leverage: '20x', profitLoss: '+$400' },
  { date: '2024-10-18', type: 'Sell', asset: 'XRP/USD', size: '5.0', leverage: '2x', profitLoss: '-$50' },
];

const History = () => {
  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-2xl shadow-2xl w-full max-w-6xl mx-auto mt-8">
      <h2 className="text-3xl font-extrabold text-center text-white mb-8 tracking-wider">Trade History</h2>

      <div className="overflow-x-auto">
        <table className="min-w-full table-auto bg-gray-800 rounded-lg border-separate border-spacing-y-2">
          <thead>
            <tr className="text-left text-gray-400 uppercase text-sm border-b border-gray-700">
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Asset</th>
              <th className="px-4 py-3">Size</th>
              <th className="px-4 py-3">Leverage</th>
              <th className="px-4 py-3">Profit/Loss</th>
            </tr>
          </thead>
          <tbody>
            {dummyData.map((trade, index) => (
              <tr
                key={index}
                className="text-white bg-gray-800 hover:bg-gray-700 transition-colors duration-200 rounded-lg shadow-md hover:shadow-lg"
              >
                <td className="px-4 py-3">{trade.date}</td>
                <td className={`px-4 py-3 font-semibold ${trade.type === 'Buy' ? 'text-green-400' : 'text-red-400'}`}>
                  {trade.type}
                </td>
                <td className="px-4 py-3">{trade.asset}</td>
                <td className="px-4 py-3">{trade.size}</td>
                <td className="px-4 py-3">{trade.leverage}</td>
                <td
                  className={`px-4 py-3 font-bold ${trade.profitLoss.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}
                >
                  {trade.profitLoss}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default History;