import React, { useEffect, useState, useContext } from "react";
import ReactApexChart from "react-apexcharts";
import futures from "../backend/contracts/futures";

const Graph = () => {
  const [timeframe, setTimeframe] = useState("1");
  const [dataArray, setDataArray] = useState([]);

  const fetchData = async () => {
    if (futures) {
      try {
        const data = await futures.methods.getOHLCVHistory().call(); // Assuming this returns an array of objects
        const formattedData = data.map((item) => ({
          blockNumber: Number(item.blockNumber),
          open: Number(item.open) / 1_000_000,
          high: Number(item.high) / 1_000_000,
          low: Number(item.low) / 1_000_000,
          close: Number(item.close) / 1_000_000,
          volume: Number(item.volume),
        }));
        formattedData.reverse();
        setDataArray(formattedData);
      } catch (error) {
        console.error("Error fetching OHLC data:", error);
      }
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 1000);

    return () => clearInterval(interval);
  }, []);

  const series = [
    {
      data: dataArray.map((data, index) => ({
        x: new Date(Date.now() - (index * 1000 * 60 * 15)),
        y: [data.open, data.high, data.low, data.close],
      })),
    },
  ];

  const options = {
    chart: {
      type: 'candlestick',
      height: 350,
      toolbar: { show: false },
      background: 'transparent',
    },
    title: {
      text: 'ETH Token Price',
      align: 'left',
      style: {
        fontSize: '22px',
        fontWeight: 'bold',
        color: '#ffffff',
      },
    },
    xaxis: {
      type: 'datetime',
      labels: {
        style: {
          colors: '#a1a1aa',
          fontSize: '12px',
          fontWeight: '600',
        },
      },
      axisBorder: { color: '#4b5563' },
      axisTicks: { color: '#4b5563' },
    },
    yaxis: {
      tooltip: { enabled: true },
      labels: {
        style: {
          colors: '#a1a1aa',
          fontSize: '12px',
          fontWeight: '600',
        },
      },
    },
    plotOptions: {
      candlestick: {
        colors: {
          upward: '#22c55e',
          downward: '#ef4444',
        },
      },
    },
    tooltip: {
      theme: 'dark',
      y: {
        formatter: (value) => value.toFixed(2),
      },
    },
  };

  return (
    <div className="w-full h-full bg-gradient-to-r from-gray-800 via-gray-900 to-black p-6 mt-4 text-white rounded-lg shadow-2xl shadow-gray-900">
      <div className="flex items-center justify-start mb-6 space-x-4">
        <select
          className="bg-gray-700 hover:bg-gray-600 text-white rounded-lg px-4 py-2 transition-all duration-200 ease-in-out cursor-pointer"
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value)}
        >
          <option value="1">1 Min</option>
          <option value="30">30 Min</option>
          <option value="60">1 Hour</option>
          <option value="240">4 Hours</option>
        </select>
        <h2 className="text-2xl font-bold text-gray-200">ETH Candlestick Chart</h2>
      </div>
      <div className="mixed-chart">
        <ReactApexChart
          options={options}
          series={series}
          type="candlestick"
          height={350}
        />
      </div>
    </div>
  );
}

export default Graph;