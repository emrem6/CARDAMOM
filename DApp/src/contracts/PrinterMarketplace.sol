// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.7.0;

contract PrinterMarketplace {
    string fileHash;
    uint offerPrice;

    function set(string memory _fileHash) public {
        fileHash = _fileHash;
    }

    function setOfferPrice(uint _offerPrice) public returns (uint) {
        offerPrice = _offerPrice;
        return offerPrice;
    }

    function get() public view returns (string memory) {
        return fileHash;
    }

    //function getOfferPrice() public view returns (string memory) {
     //   return offerPrice;
    //}
}
