async function writeOfferToContract(_offerprice, _contract, _account) {
    console.log('offerprice: ', _offerprice,
    '_contract: ', _contract,
    'account', _account)
    await _contract.methods.setOfferPrice(100).send({ from: _account })
    //console.log('offerPrice: ', _contract.methods.getOfferPrice()) test
}
module.exports = {
    writeOfferToContract
};