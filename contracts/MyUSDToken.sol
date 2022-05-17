// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract MyUSDToken is ERC20, Ownable, ReentrancyGuard {
    constructor()ERC20("MyUSD20", "MyUSD20"){}

    function mint(uint256 amount) external onlyOwner nonReentrant {
        _mint(msg.sender, amount);
    }
}
