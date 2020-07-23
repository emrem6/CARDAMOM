pragma solidity ^0.5.0;

contract PrinterMarketplace {
    string[] public fileHash;
    uint256 public requestCount = 0;
    uint256 public offerCount = 0;
    string offerPrice;

    struct Request {
        uint256 id;
        string[] fileHash;
    }

    event RequestCreated(
        uint256 id
        //string[] fileHash
    );

    event OfferReceived(uint256 id);

    function set(string memory _fileHash) public {
        requestCount++;
        fileHash[requestCount] = _fileHash;
    }

    function get() public view returns (string memory) {
        return fileHash[requestCount];
    }

    function createRequest(string memory _fileHash) public payable {
        requestCount++;
        fileHash[requestCount] = _fileHash;
        emit RequestCreated(requestCount);
    }

    function setOfferPrice(string memory _offerPrice) public {
        offerPrice = _offerPrice;
        offerCount++;
        //emit OfferReceived(offerCount);
    }

    function getOffers() public view returns (string memory) {
        return offerPrice;
    }
}
