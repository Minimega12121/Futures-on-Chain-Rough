// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Token is ERC20, Ownable {
    uint256 dec = 10**18;

    constructor() ERC20("Token", "TKN")  Ownable(msg.sender){
        _mint(msg.sender, 1000000 * dec);
    }

    // Function to mint tokens, only callable by the owner
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}