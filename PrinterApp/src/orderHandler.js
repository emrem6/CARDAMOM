const path = require('path');
const printerManager = require(path.join(__dirname, 'printerManager.js'));
const contractABI = require(path.join(__dirname, '../contractABI.json'));
const Web3 = require('web3');
const { setTimeout } = require('timers');
const config = require(path.join(__dirname, '../config', 'PrinterConfig.json'));
const contractAddress = config.contractAddress;
let contract
let start = 1;


// initialize contract
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

init()
// TimeOut is absoluteley necessary here because otherwise evenHandler is firing before init is done, despite the async await
setTimeout(() => {
    eventhandler()
}, 3000);

async function eventhandler() {
    var event = await contract.events.OrderEvent({}, { fromBlock: 8649194, toBlock: 'latest' })
        .on('connected', function (subscriptionId) {
            console.log("CONNECTED TO ORDEREVENT", subscriptionId)
            if (start == 1) {
                start = 0;
            }
        })
        .on('data', function (event) {
            if (start != 1 && event.returnValues.provider == config.account) {
                console.log('NEW ORDER RECEIVED: ', event)
                processNewOrder(event.returnValues.id, event.returnValues.filehash, event.returnValues.client, event.returnValues.provider, event.returnValues.price)
            }
        })
        .on('changed', function (event) {
            console.log("EVENT REMOVED FROM THE BLOCKCHAIN", event)
        })
        .on('error', console.error);
}

//check orders
async function processNewOrder(_id, _fileHash, _client, _provider, _price) {
    console.log(printerManager)
    setTimeout(() => {
        printerManager.sendFileToPrinter(_fileHash)
    }, 10 * 1000);
    setTimeout(() => {
        printerManager.startPrinter(_fileHash)
    }, 10 * 1000);
}
