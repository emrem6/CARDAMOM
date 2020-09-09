//l
//"contractAddress": "0x8285ed4dbfba6faa5bd9da628579239168dd2e06",
//"contractAddress": "0x8d655523437352bbe5b73cc5812a255d9f993091",
const fs = require('fs');
const axios = require('axios');
const Web3 = require('web3');
const path = require('path');
const contractABI = require(path.join(__dirname, '../contractABI.json'));
const config = require(path.join(__dirname, '../config', 'PrinterConfig.json'));
const cura = require(path.join(__dirname, 'CallCura.js'));
const priceCalculation = require(path.join(__dirname, 'PriceCalculation.js'));
const offerQuotation = require(path.join(__dirname, 'OfferQuotation.js'));
const exchangeEURinETH = require(path.join(__dirname, 'exchangeEURinETH.js'));
const account = config.account;
const contractAddress = config.contractAddress;
var offerPrice;
var curaValues;
var web3;
let start = 1;
let contract;

async function init() {
    try {
        console.log('Starting Server...')
        if (typeof web3 !== 'undefined') {
            web3 = await new Web3(web3.currentProvider);
        } else {
            //web3 = await new Web3(new Web3.providers.HttpProvider('https://ropsten.infura.io/v3/c968bc8207224bbf8eff18c811b31739'));
            web3 = await new Web3(new Web3.providers.WebsocketProvider('wss://ropsten.infura.io/ws/v3/c968bc8207224bbf8eff18c811b31739'));
        }
        await web3.eth.net.isListening()
            .then(() => console.log('web3 is connected'))
            .catch(e => console.log('Something went wrong'));
        contract = await new web3.eth.Contract(
            contractABI,
            contractAddress);
    }
    catch (error) {
        console.log('ERROR: initialization error', error)
    }
}
// in order to build the app, init() must be called to run the constructor function 
init();
// TimeOut is absoluteley necessary here because otherwise evenHandler is firing before init is done, despite the async await
setTimeout(() => {
    eventhandler()
}, 3000);

async function eventhandler() {
    var event = await contract.events.InquiryEvent({}, { fromBlock: 8648597, toBlock: 'latest' })
        .on('connected', function (subscriptionId) {
            console.log("CONNECTED TO REQUESTEVENT", subscriptionId)
            if (start == 1) {
                start = 0;
            }
        })
        .on('data', function (event) {
            console.log('NEW REQUEST RECEIVED: ', event)
            if (start != 1) {
                processNewRequest(event.returnValues.id, event.returnValues.client, event.returnValues.filehash)
            }
        })
/*         .on('changed', function (event) {
            console.log("EVENT REMOVED FROM THE BLOCKCHAIN", event)
        }) */
        .on('error', console.error);
}
async function processNewRequest(_id, _client, _filehash) {
    try {
        console.log('STARTING REQUEST HANDLING PROCESS')
        // 1. Get file from IPFS
        axios({
            method: 'get',
            url: 'https://gateway.ipfs.io./ipfs/' + _filehash,
            responseType: 'stream'
        })
            .then(function (response, error) {
                if (error) {
                    console.error(error);
                    return;
                }
                response.data.pipe(fs.createWriteStream('../files/input/' + _filehash + '.stl'))
            });
        // 2. determine printtime and filament usage
        curaValues = await cura.callCura(_filehash);
        console.log(curaValues);
        // 3. calculate offer price
        offerPrice = await priceCalculation.calculatePrice(curaValues)
        console.log('OFFERPRICE: ', offerPrice)
        // 4. convert offerprice from € into ETH
        const exchangeRate = await exchangeEURinETH.exchangeEURinETH()
        console.log('EXCHANGE RATE: ', exchangeRate)
        let offerPriceETH = offerPrice / parseFloat(exchangeRate)
        console.log('OFFERPRICE IN ETH: ', offerPriceETH)
        offerPriceETH = offerPriceETH.toString();
        const decimalPlaces = offerPriceETH.split(".")[1].length
        console.log('DECIMALPLACES: ', decimalPlaces)
        // conversion toWei requires exactly 18 or less after commaplaces, this is to be checked
/*         if (decimalPlaces > 18) {
            offerPriceETH = offerPriceETH.slice(0, parseInt(offerPriceETH.indexOf('.')) + 19)
            console.log('OFFERPRICE IN ETH (prepared): ', offerPriceETH)
        }
        const offerPriceWEI = await web3.utils.toWei(offerPriceETH, 'Ether')
        console.log('OFFERPRICE IN WEI', offerPriceWEI) */
        console.log("BALANCE: ", await web3.eth.getBalance(account));
        // 4. transact offerprice into smart contract
       // offerQuotation.sendTransaction(_id, parseInt(offerPriceWEI), _filehash, contract, _client, web3)
       offerQuotation.sendTransaction(_id, offerPriceETH, _filehash, contract, _client, web3)
    }
    catch (error) {
        console.error(error)
    }
}
