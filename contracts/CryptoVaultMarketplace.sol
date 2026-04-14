// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title CryptoVault Marketplace
 * @dev Manages player gear trading with marketplace commission
 */
contract CryptoVaultMarketplace is Ownable {
    uint256 public constant COMMISSION_RATE = 5; // 5% commission
    
    struct Listing {
        address seller;
        uint256 price;
        bool active;
    }

    mapping(uint256 => Listing) public listings;
    
    event ItemListed(uint256 indexed itemId, address indexed seller, uint256 price);
    event ItemSold(uint256 indexed itemId, address indexed buyer, uint256 price);

    /**
     * @dev List an item for sale
     */
    function listItem(uint256 itemId, uint256 price) external {
        require(price > 0, "Price must be > 0");
        listings[itemId] = Listing(msg.sender, price, true);
        emit ItemListed(itemId, msg.sender, price);
    }

    /**
     * @dev Cancel a listing
     */
    function cancelListing(uint256 itemId) external {
        require(listings[itemId].seller == msg.sender, "Not seller");
        listings[itemId].active = false;
    }

    /**
     * @dev Buy an item (stub - actual payment in frontend)
     */
    function buyItem(uint256 itemId) external {
        require(listings[itemId].active, "Item not listed");
        address seller = listings[itemId].seller;
        listings[itemId].active = false;
        emit ItemSold(itemId, msg.sender, listings[itemId].price);
    }
}
