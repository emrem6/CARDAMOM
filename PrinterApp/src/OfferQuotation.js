const path = require('path');
const config = require(path.join(__dirname, '../config', 'PrinterConfig.json'));
const PK = config.privateKey;
const contractAddress = config.contractAddress;
const account = config.account;


async function sendTransaction(_requestid, _offerprice, _fileHash, _contract, _client, _web3) {
    var Tx = require('ethereumjs-tx').Transaction;
    var privateKey = Buffer.from(PK, 'hex')
    var dataOfSetOffer = await _contract.methods.setOffer(_requestid, _offerprice, _fileHash, _client, account).encodeABI();
    var nonce = await _web3.eth.getTransactionCount(account);
    nonce = '0x' + nonce.toString(16)

    var rawTx = {
        nonce: nonce,
        gasPrice: await _web3.utils.toHex('225500000000'), // 2255000000000
        gasLimit: await _web3.utils.toHex('300000'),
        to: contractAddress,
        value: await _web3.utils.toHex('0'),
        data: dataOfSetOffer,
    }

    var tx = new Tx(rawTx, { 'chain': 'ropsten' });
    tx.sign(privateKey);

    var serializedTx = tx.serialize();

    const receipt = await _web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'), function (err, hash) {
        if (err)
            console.log('ERROR:', err)
        else
            console.log('TRANSACTION RECORDED WITH TXN HASH: ', hash, ' WAITING FOR RECEIPT')
    })
        .on('receipt', console.log);
    console.log('OFFER SUCCESSFULLY WRITTEN IN CONTRACT')
}
module.exports = {
    sendTransaction
};