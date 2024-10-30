import React, { useContext } from "react";
import { MetaMaskContext } from "../MetaMaskContext";
import { User } from 'lucide-react';

const Navbar = () => {
  const { account, connectToMetaMask } = useContext(MetaMaskContext);

  return (
    <nav className="bg-gradient-to-r from-gray-900 via-black to-gray-900 h-16 w-full flex items-center px-4 shadow-md">
      <h1 className="text-xl font-bold text-white tracking-wider">Trading Dashboard</h1>
      <button
        onClick={connectToMetaMask}
        className="ml-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-full transition-transform transform hover:scale-105"
      >
        {account ? (
      <>
        <User className="w-6 h-6 inline-block mr-2" />
        {`${account.slice(0, 6)}...${account.slice(-4)}`}
      </>
    ) : (
      "Connect"
    )}
      </button>
    </nav>
  );
};

export default Navbar;