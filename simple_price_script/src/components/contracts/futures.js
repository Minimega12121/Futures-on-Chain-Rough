import web3 from "./web3";

const address = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";


const abi = [
	{
		"inputs": [
			{
				"internalType": "bytes21",
				"name": "_roflAppID",
				"type": "bytes21"
			},
			{
				"internalType": "uint8",
				"name": "_threshold",
				"type": "uint8"
			}
		],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [],
		"name": "RoflOriginNotAuthorizedForApp",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "SubcallError",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "positionIndex",
				"type": "uint256"
			}
		],
		"name": "calculatePnL",
		"outputs": [
			{
				"internalType": "int128",
				"name": "",
				"type": "int128"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "calls",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "positionIndex",
				"type": "uint256"
			}
		],
		"name": "closePosition",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "currentMarketPrice",
		"outputs": [
			{
				"internalType": "uint128",
				"name": "",
				"type": "uint128"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "dailyExchangeVolume",
		"outputs": [
			{
				"internalType": "uint128",
				"name": "",
				"type": "uint128"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "dailyHigh",
		"outputs": [
			{
				"internalType": "uint128",
				"name": "",
				"type": "uint128"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "dailyLow",
		"outputs": [
			{
				"internalType": "uint128",
				"name": "",
				"type": "uint128"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getOHLCVHistory",
		"outputs": [
			{
				"components": [
					{
						"internalType": "uint128",
						"name": "open",
						"type": "uint128"
					},
					{
						"internalType": "uint128",
						"name": "high",
						"type": "uint128"
					},
					{
						"internalType": "uint128",
						"name": "low",
						"type": "uint128"
					},
					{
						"internalType": "uint128",
						"name": "close",
						"type": "uint128"
					},
					{
						"internalType": "uint128",
						"name": "volume",
						"type": "uint128"
					},
					{
						"internalType": "uint256",
						"name": "blockNumber",
						"type": "uint256"
					}
				],
				"internalType": "struct Oracle.OHLCV[15]",
				"name": "",
				"type": "tuple[15]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getOrderbookHistory",
		"outputs": [
			{
				"components": [
					{
						"internalType": "uint128",
						"name": "bidPrice",
						"type": "uint128"
					},
					{
						"internalType": "uint128",
						"name": "bidVolume",
						"type": "uint128"
					},
					{
						"internalType": "uint128",
						"name": "askPrice",
						"type": "uint128"
					},
					{
						"internalType": "uint128",
						"name": "askVolume",
						"type": "uint128"
					},
					{
						"internalType": "uint256",
						"name": "blockNumber",
						"type": "uint256"
					}
				],
				"internalType": "struct Oracle.Orderbook[15]",
				"name": "",
				"type": "tuple[15]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "historyIndex",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "indexPrice",
		"outputs": [
			{
				"internalType": "uint128",
				"name": "",
				"type": "uint128"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "ohlcvHistory",
		"outputs": [
			{
				"internalType": "uint128",
				"name": "open",
				"type": "uint128"
			},
			{
				"internalType": "uint128",
				"name": "high",
				"type": "uint128"
			},
			{
				"internalType": "uint128",
				"name": "low",
				"type": "uint128"
			},
			{
				"internalType": "uint128",
				"name": "close",
				"type": "uint128"
			},
			{
				"internalType": "uint128",
				"name": "volume",
				"type": "uint128"
			},
			{
				"internalType": "uint256",
				"name": "blockNumber",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "openCalls",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint128",
				"name": "_leverage",
				"type": "uint128"
			},
			{
				"internalType": "uint128",
				"name": "tokenAmount",
				"type": "uint128"
			},
			{
				"internalType": "bool",
				"name": "_isBuy",
				"type": "bool"
			}
		],
		"name": "openPosition",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "openPositions",
		"outputs": [
			{
				"internalType": "uint128",
				"name": "leverage",
				"type": "uint128"
			},
			{
				"internalType": "uint128",
				"name": "entryPrice",
				"type": "uint128"
			},
			{
				"internalType": "uint128",
				"name": "tokenUnits",
				"type": "uint128"
			},
			{
				"internalType": "uint128",
				"name": "collateral",
				"type": "uint128"
			},
			{
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "isBuy",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "orderbookHistory",
		"outputs": [
			{
				"internalType": "uint128",
				"name": "bidPrice",
				"type": "uint128"
			},
			{
				"internalType": "uint128",
				"name": "bidVolume",
				"type": "uint128"
			},
			{
				"internalType": "uint128",
				"name": "askPrice",
				"type": "uint128"
			},
			{
				"internalType": "uint128",
				"name": "askVolume",
				"type": "uint128"
			},
			{
				"internalType": "uint256",
				"name": "blockNumber",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "orderbookIndex",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "pnlHistory",
		"outputs": [
			{
				"internalType": "int128",
				"name": "",
				"type": "int128"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "positionsCount",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "roflAppID",
		"outputs": [
			{
				"internalType": "bytes21",
				"name": "",
				"type": "bytes21"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "settledPositions",
		"outputs": [
			{
				"internalType": "uint128",
				"name": "leverage",
				"type": "uint128"
			},
			{
				"internalType": "uint128",
				"name": "entryPrice",
				"type": "uint128"
			},
			{
				"internalType": "uint128",
				"name": "tokenUnits",
				"type": "uint128"
			},
			{
				"internalType": "uint128",
				"name": "collateral",
				"type": "uint128"
			},
			{
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "isBuy",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint128",
				"name": "_marketPrice",
				"type": "uint128"
			},
			{
				"internalType": "uint128",
				"name": "_dailyExchangeVolume",
				"type": "uint128"
			},
			{
				"internalType": "uint128",
				"name": "_dailyHigh",
				"type": "uint128"
			},
			{
				"internalType": "uint128",
				"name": "_dailyLow",
				"type": "uint128"
			}
		],
		"name": "submitMarketObservations",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint128",
				"name": "open",
				"type": "uint128"
			},
			{
				"internalType": "uint128",
				"name": "high",
				"type": "uint128"
			},
			{
				"internalType": "uint128",
				"name": "low",
				"type": "uint128"
			},
			{
				"internalType": "uint128",
				"name": "close",
				"type": "uint128"
			},
			{
				"internalType": "uint128",
				"name": "volume",
				"type": "uint128"
			}
		],
		"name": "submitOHLCVObservation",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint128",
				"name": "bidPrice",
				"type": "uint128"
			},
			{
				"internalType": "uint128",
				"name": "bidVolume",
				"type": "uint128"
			},
			{
				"internalType": "uint128",
				"name": "askPrice",
				"type": "uint128"
			},
			{
				"internalType": "uint128",
				"name": "askVolume",
				"type": "uint128"
			}
		],
		"name": "submitOrderbookData",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "threshold",
		"outputs": [
			{
				"internalType": "uint8",
				"name": "",
				"type": "uint8"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "token",
		"outputs": [
			{
				"internalType": "contract IMintableERC20",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]

const futures= new web3.eth.Contract(abi, address);

export default futures;

