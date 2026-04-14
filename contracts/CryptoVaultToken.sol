// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title CryptoVault Token
 * @dev Implementation of the CVT token (ERC-20)
 */
contract CryptoVaultToken is ERC20, Ownable {
    uint256 public constant TOTAL_SUPPLY = 1_000_000_000 * 10 ** 18; // 1 billion tokens
    
    constructor() ERC20("CryptoVault Token", "CVT") {
        _mint(msg.sender, TOTAL_SUPPLY);
    }

    /**
     * @dev Mint rewards when players loot
     * Only callable by owner (backend will be owner)
     */
    function mintRewards(address player, uint256 amount) external onlyOwner {
        require(player != address(0), "Invalid address");
        _mint(player, amount);
    }

    /**
     * @dev Burn tokens (for deflationary mechanics)
     */
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }
}
