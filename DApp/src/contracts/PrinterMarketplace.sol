// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.7.0;

contract PrinterMarketplace {
    uint256 public requestCount = 0;
    uint256 public offerCount = 0;
    uint256 public orderCount = 0;

    mapping(uint256 => Request) public requests;
    struct Request {
        uint256 id;
        address payable client;
        string fileHash;
    }
    mapping(uint256 => Offer) public offers;
    struct Offer {
        uint256 id;
        uint256 price;
        string fileHash;
        address payable client;
        address payable provider;
        bool purchased;
    }
    mapping(uint256 => Order) public orders;
    struct Order {
        uint256 id;
        uint256 price;
        address payable client;
        address payable provider;
        bool purchased;
        string fileHash;

    }

    function setRequest(string memory _fileHash) public {
        requestCount++;
        requests[requestCount] = Request(requestCount, msg.sender, _fileHash);
    }

    function setOffer(uint256 _offerPrice, string memory _fileHash, address payable _client, address payable _provider) public {
        offerCount++;
        offers[offerCount] = Offer(
            offerCount,
            _offerPrice,
            _fileHash,
            _client,
            _provider,
            false
        );
    }

    /*     function get() public view returns (string memory) {
        return fileHash;
    } */

    function purchaseOffer(
        uint256 _id,
        uint256 _orderPrice,
        address payable _client,
        address payable _provider,
        string memory _fileHash
    ) public payable {
        orderCount++;
        //fetch the offer
        // Order memory _order = Order(_id, _orderPrice, _owner, true);
        orders[orderCount] = Order(_id, _orderPrice, _client, _provider, true, _fileHash);
        //pay the seller by sendding them ether
        address(uint160(_provider)).transfer(msg.value);
    }
}
