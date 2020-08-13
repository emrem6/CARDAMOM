async function writeOfferToContract(_offerprice,_fileHash, _contract, _client, _account) {
    /*      console.log('offerprice: ', _offerprice,
        '_contract: ', _contract,
        'account', _account)  */
    if (_offerprice != 'undefined' && _contract != 'undefined') {
        try {
            await _contract.methods.setOffer(_offerprice, _fileHash, _client, _account).send({ from: _account, gas: 3000000 })
            console.log('OFFER SUCCESSFULLY WRITTEN IN CONTRACT')
        } catch (error) {
            console.log('Error in setOfferPrice: ', error)
        }
    }
    //console.log('offerPrice: ', _contract.methods.getOfferPrice()) test
}
module.exports = {
    writeOfferToContract
};