// SPDX-License-Identifier: MIT
pragma solidity >=0.8.9 <=0.8.24;

import {Subcall} from "@oasisprotocol/sapphire-contracts/contracts/Subcall.sol";

contract Oracle {

    // Configuration
    uint8 public threshold;
    bytes21 public roflAppID;
    uint public calls = 0;
    uint128 public marketPrice;
    // OHLCV Data Structure
    struct OHLCV {
        uint128 open;
        uint128 high;
        uint128 low;
        uint128 close;
        uint128 volume;
        uint block;
    }

    OHLCV[15] public ohlcvHistory;
    uint256 public historyIndex = 0;

    constructor(bytes21 _roflAppID, uint8 _threshold) {
        require(_threshold > 0, "Invalid threshold");
        roflAppID = _roflAppID;
        threshold = _threshold;
        marketPrice = 0;
    }

   // submit call only via Rofl_runtime
   function submitOHLCVObservation(
    uint128 open,
    uint128 high,
    uint128 low,
    uint128 close,
    uint128 volume
) external {
    // Ensure only the authorized ROFL app can submit.
    Subcall.roflEnsureAuthorizedOrigin(roflAppID);
    calls++;
    ohlcvHistory[historyIndex] = OHLCV({
        open: open,
        high: high,
        low: low,
        close: close,
        volume: volume,
        block: block.number
    });
    historyIndex = (historyIndex + 1) % 15;
}
 // submit call only via Rofl_runtime
   function submitMarketPriceObservation(
    uint128 _marketPrice
) external {
    // Ensure only the authorized ROFL app can submit.
    Subcall.roflEnsureAuthorizedOrigin(roflAppID);
    calls++;
    marketPrice = _marketPrice;
}

    function getOHLCVHistory() external view returns (OHLCV[15] memory) {
        return ohlcvHistory;
    }
}
// npx hardhat compile
// export PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
// npx hardhat deploy rofl1qqn9xndja7e2pnxhttktmecvwzz0yqwxsquqyxdf --network sapphire-localnet