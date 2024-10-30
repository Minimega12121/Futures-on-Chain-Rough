import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import web3 from '../backend/contracts/web3';
import futures from '../backend/contracts/futures';

const History = () => {
  const [openPositions, setOpenPositions] = useState([]);
  const [closedPositions, setClosedPositions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPositions = async () => {
    try {
      const accounts = await web3.eth.getAccounts();
      if (!accounts.length) {
        console.error("No accounts found. Please connect your wallet.");
        setIsLoading(false);
        return;
      }
      const userAddress = accounts[0];

      // Fetch Open Positions
      const openPosCount = Number(await futures.methods.positionsCount(userAddress, 0).call());
      let openPosArray = [];

      for (let i = 0; i < openPosCount; i++) {
        const pos = await futures.methods.openPositions(userAddress, i).call();
        const pnl = await futures.methods.calculatePnL(userAddress, i).call();

        openPosArray.push({
          index: i,
          leverage: Number(pos[0]),
          entryPrice: (Number(pos[1]) / 1_000_000).toFixed(2),
          tokenUnits: Number(pos[2]),
          collateral: Number(pos[3]),
          timestamp: new Date(Number(pos[4]) * 1000).toLocaleString(),
          isBuy: pos[5],
          pnl: Number(pnl) / 1_000_000
        });
      }
      setOpenPositions(openPosArray);

      // Fetch Closed Positions
      const closedPosCount = Number(await futures.methods.positionsCount(userAddress, 1).call());
      let closedPosArray = [];

      for (let i = 0; i < closedPosCount; i++) {
        const pos = await futures.methods.settledPositions(userAddress, i).call();
        const pnl = await futures.methods.pnlHistory(userAddress, i).call();

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
      setClosedPositions(closedPosArray);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching positions:", error);
      setIsLoading(false);
    }
  };

  const handleClosePosition = async (positionIndex) => {
    try {
      const accounts = await web3.eth.getAccounts();
      await futures.methods.closePosition(positionIndex).send({
        from: accounts[0],
        gasPrice: web3.utils.toWei("150", "gwei"),
        gas: 300000
      });
      alert("Position closed successfully!");
      fetchPositions(); // Refresh the positions after closing
    } catch (error) {
      console.error("Error closing position:", error);
      alert("Failed to close position. Please try again.");
    }
  };

  useEffect(() => {
    const interval = setInterval(fetchPositions, 1000); // Update every second
    return () => clearInterval(interval);
  }, []);

  const EmptyState = ({ message }) => (
    <div className="text-center py-8">
      <p className="text-gray-400 text-lg">{message}</p>
    </div>
  );

  const PositionTable = ({ positions, isLive = false }) => (
    <div className="mb-12">
      <h2 className="text-2xl font-bold text-white mb-6">
        {isLive ? "Live Positions" : "Settled Positions"}
      </h2>
      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-gray-400">Loading positions...</p>
          </div>
        ) : positions.length > 0 ? (
          <table className="min-w-full table-auto bg-gray-800 rounded-lg border-separate border-spacing-y-2">
            <thead>
              <tr className="text-left text-gray-400 uppercase text-sm border-b border-gray-700">
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Entry Price</th>
                <th className="px-4 py-3">Size</th>
                <th className="px-4 py-3">Leverage</th>
                <th className="px-4 py-3">Collateral</th>
                <th className="px-4 py-3">PnL</th>
                {isLive && <th className="px-4 py-3">Action</th>}
              </tr>
            </thead>
            <tbody>
              {positions.map((position, index) => (
                <tr
                  key={index}
                  className="text-white bg-gray-800 hover:bg-gray-700 transition-colors duration-200 rounded-lg shadow-md hover:shadow-lg"
                >
                  <td className="px-4 py-3">{position.timestamp}</td>
                  <td className={`px-4 py-3 font-semibold ${position.isBuy ? 'text-green-400' : 'text-red-400'}`}>
                    {position.isBuy ? 'Buy' : 'Sell'}
                  </td>
                  <td className="px-4 py-3">${position.entryPrice}</td>
                  <td className="px-4 py-3">{position.tokenUnits}</td>
                  <td className="px-4 py-3">{position.leverage}x</td>
                  <td className="px-4 py-3">${position.collateral}</td>
                  <td className={`px-4 py-3 font-bold ${position.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    ${position.pnl.toFixed(2)}
                  </td>
                  {isLive && (
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleClosePosition(position.index)}
                        className="p-2 bg-red-500 hover:bg-red-600 rounded-full transition-colors duration-200"
                        title="Close Position"
                      >
                        <X size={16} className="text-white" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <EmptyState message="No positions taken by the user" />
        )}
      </div>
    </div>
  );

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-2xl shadow-2xl w-full max-w-6xl mx-auto mt-8">
      <h1 className="text-3xl font-extrabold text-center text-white mb-8 tracking-wider">Trade History</h1>
      <PositionTable positions={openPositions} isLive={true} />
      <PositionTable positions={closedPositions} isLive={false} />
    </div>
  );
};

export default History;

