import React, { createContext, useState } from 'react';

// Create context
export const MetaMaskContext = createContext();

// Create provider component
export const MetaMaskProvider = ({ children }) => {
  const [account, setAccount] = useState(null);

  // Method to connect to MetaMask
  const connectToMetaMask = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
        console.log('Connected to MetaMask account:', accounts[0]);
      } catch (error) {
        console.error('Error connecting to MetaMask:', error);
      }
    } else {
      alert('MetaMask is not installed. Please install MetaMask!');
    }
  };

  return (
    <MetaMaskContext.Provider value={{ account, connectToMetaMask }}>
      {children}
    </MetaMaskContext.Provider>
  );
};
