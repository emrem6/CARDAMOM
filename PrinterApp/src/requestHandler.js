/* this script is handling the requests created via the marketplace DApp and emitted in the Smart Contract
first it connects to ropsten web3 provider
second it listens to inquiry events emitted in the smart contract
third it processes the incoming event  
 */
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
let contract;

async function init() {
    try {
        console.log('Starting Server...')
        if (typeof web3 !== 'undefined') {
            web3 = await new Web3(web3.currentProvider);
        } else {
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
// TimeOut is absoluteley necessary here because otherwise evenHandler is triggering before init is done, despite the async await
setTimeout(() => {
    eventhandler()
}, 10 * 1000);

async function eventhandler() {
    //    var event = await contract.events.InquiryEvent({}, { fromBlock: 8670045, toBlock: 'latest' })
    var event = await contract.events.InquiryEvent({}, { filter: { status: ['open'] }, toBlock: 'latest' })
        .on('connected', function (subscriptionId) {
            console.log("CONNECTED TO REQUESTEVENT - SUBSCRIPTION ID: ", subscriptionId)
        })
        .on('data', function (event) {
            if (event.returnValues.status = 'open') {
                console.log('NEW INQUIRY RECEIVED: ', event.returnValues)
                processNewRequest(event.returnValues.id, event.returnValues.client, event.returnValues.filehash)
            }
        })
        .on('error', console.error);
}
async function processNewRequest(_id, _client, _filehash) {
    try {
        console.log('STARTING REQUEST HANDLING PROCESS')
        let promise1 = Promise.resolve(
            // 1. Get file from IPFS
            await axios({
                method: 'get',
                url: 'https://gateway.ipfs.io./ipfs/' + _filehash,
                responseType: 'stream'
            })
                .then(async function (response, error) {
                    if (error) {
                        console.error(error);
                        return;
                    }
                    await response.data.pipe(fs.createWriteStream('../files/input/' + _filehash + '.stl'))
                }));
        Promise.all([promise1]).then(async (responses) => {
            setTimeout(async() => {
                curaValues = await cura.callCura(_filehash)
                console.log(curaValues)
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
                console.log("BALANCE: ", await web3.eth.getBalance(account));
                // 4. transact offerprice into smart contract
                offerQuotation.sendTransaction(_id, offerPriceETH, _filehash, contract, _client, web3)
            }, 3000);
        })
    }
    catch (error) {
        console.error(error)
    }
}