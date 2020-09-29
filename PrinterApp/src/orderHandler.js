/* this script is handling the orders created via the marketplace DApp and emitted in the Smart Contract
first it connects to ropsten web3 provider
second it listens to order events emitted in the smart contract
third it processes the incoming order event while sending via REST the gcode file to the printer and giving the command to start print 
 */
const path = require('path');
const printerManager = require(path.join(__dirname, 'printerManager.js'));
const contractABI = require(path.join(__dirname, '../contractABI.json'));
const Web3 = require('web3');
const { setTimeout } = require('timers');
const config = require(path.join(__dirname, '../config', 'PrinterConfig.json'));
const contractAddress = config.contractAddress;
let contract

// initialize contract
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

init()
// TimeOut is absoluteley necessary here because otherwise evenHandler is firing before init is done, despite the async await
setTimeout(() => {
    eventhandler()
}, 10 * 1000);

async function eventhandler() {
    var event = await contract.events.OrderEvent({}, { filter: { status: ['purchased'] }, toBlock: 'latest' })
        .on('connected', function (subscriptionId) {
            console.log("CONNECTED TO ORDEREVENT", subscriptionId)
        })
        .on('data', function (event) {
            console.log(event.returnValues.status)
            if (event.returnValues.status == 'purchased' &&
                event.returnValues.provider == config.account) {
                console.log('NEW ORDER RECEIVED: ', event.returnValues)
                processNewOrder(event.returnValues.filehash)
            }
        })
        .on('changed', function (event) {
            console.log("EVENT REMOVED FROM THE BLOCKCHAIN", event)
        })
        .on('error', console.error);
}

async function processNewOrder(_fileHash) {
    console.log(printerManager)
    setTimeout(() => {
        printerManager.sendFileToPrinter(_fileHash)
    }, 10 * 1000);
    setTimeout(() => {
        printerManager.startPrinter(_fileHash)
    }, 10 * 1000);
}