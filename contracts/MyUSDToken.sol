// SPDX-License-Identifier: MIT
pragma solidity ^0.8.14;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MyUSDToken is ERC20 {
    constructor() ERC20("Gold", "GLD") {
        _mint(msg.sender, 10000000000000000);
    }

    function mint() external  {
        _mint(msg.sender, 200000000000000);
    }
}
