// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

contract PriceUpdation{


  uint256 public marketprice;

  constructor(uint256 _price){
    marketprice = _price;
  }

    function updatePrice(uint256 _price) public {
        marketprice = _price;
    }

}
