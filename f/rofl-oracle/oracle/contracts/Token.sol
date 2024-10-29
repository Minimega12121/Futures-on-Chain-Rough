// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Token is ERC20 {
    uint256 private dec = 10**18; // 1 Token = 1 * 10^18

    constructor() ERC20("Token", "TKN") {
        _mint(msg.sender, 1000000 * dec); // Mint 1,000,000 tokens to the contract deployer
    }

    // Function to mint tokens, only callable by the owner
    function mint(address to, uint256 amount)external{
        _mint(to, amount);
    }

    // Function for faucet to distribute tokens
    function faucet(uint256 amount) external {
        require(amount <= 10000 * dec, "Maximum 100 tokens per request"); // Limit faucet distribution
        _mint(msg.sender, amount);
    }
}
