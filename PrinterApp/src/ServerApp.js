const ipfsAPI = require('ipfs-api');
const express = require('express');
const app = express();
const fs = require('fs');
const https = require('https');
const Web3 = require('web3');
const path = require('path');
const { request } = require('http');
const { resolve } = require('dns');
const PrinterMarketplace = require(path.join(__dirname, '../../DApp/src/abis/PrinterMarketplace.json'));
const cura = require(path.join(__dirname, 'CallCura.js'));
const priceCalculation = require(path.join(__dirname, 'PriceCalculation.js'));
const offerQuotation = require(path.join(__dirname, 'OfferQuotation.js'));
const ipfs = ipfsAPI('ipfs.infura.io', '5001', { protocol: 'https' });
const exchangeEURinETH = require(path.join(__dirname, 'exchangeEURinETH.js'));
const orderProcessing = require(path.join(__dirname, 'orderProcessing.js'));
const printerManager = require(path.join(__dirname, 'printerManager.js'));



var fileHashList = new Array();
var requests = new Array;
var offerPrice;
var fileHash;
var clientAddress;
var curaValues;

let accounts;
let contract;
// initialize DApp
async function init() {
    try {
        console.log('Starting Server...')
        if (typeof web3 !== 'undefined') {
            web3 = new Web3(web3.currentProvider);
        } else {
            web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:7545'));
            //web3 = new Web3('http://127.0.0.1:7545');
        }
        //const web3 = new Web3('http://127.0.0.1:7545');
        accounts = await web3.eth.getAccounts();
        //console.log('Accounts: ', accounts)
        const id = await web3.eth.net.getId();
        // console.log('Network ID:', id);
        const networkData = PrinterMarketplace.networks[id];
        // console.log(networkData);
        contract = await new web3.eth.Contract(
            PrinterMarketplace.abi,
            networkData.address);
    }
    catch (error) {
        console.log('ERROR: initialization error')
    }
}

// in order to build the app, init() must be called to run the constructor function 
init();
// check for new requests
async function checkForRequests() {
    console.log("Searching for new requests..");
    // Load requests
    const requestCount = await contract.methods.requestCount().call()
    for (var i = 1; i <= requestCount; i++) {
        requests[i] = await contract.methods.requests(i).call()
        if (fileHashList.includes(requests[i].fileHash) == false) {
            console.log('NEW REQUEST FOUND - HASH: ', requests[i].fileHash)
            console.log('CLIENT ADRESS: ', requests[i].client)
            fileHash = requests[i].fileHash;
            clientAddress = requests[i].client;
            fileHashList.push(fileHash)
            console.log('ALREADY PROGRESSED HASHES: ', fileHashList)
            // create a stream to post the file content.
            var printfilepath = "https://ipfs.infura.io/ipfs/" + fileHash;
            const printfile = fs.createWriteStream('../files/input/' + fileHash + '.stl');

            https.get(printfilepath, function (response) {
                response.pipe(printfile);
            })

            // get file from IPFS
            await ipfs.files.get(fileHash, function (err, files) {
                files.forEach((file) => {
                    console.log('path:', file.path)
                    //console.log(file.content.toString('utf8')) 
                    console.log('printfilepath:', printfilepath)
                })
            })
            // run cura
            setTimeout(async function runcura() {
                curaValues = await cura.callCura(fileHash);
                console.log(curaValues);
                // run Pricecalculation
                offerPrice = await priceCalculation.calculatePrice(curaValues)
                console.log('######################')
                console.log('offerprice', offerPrice)
                console.log('######################')
            }, 15 * 1000);
            setTimeout(async function () {
                if (offerPrice > 0) {
                    const exchangeRate = await exchangeEURinETH.exchangeEURinETH()
                    console.log('EXCHANGE RATE: ', exchangeRate)
                    let offerPriceETH = offerPrice / parseFloat(exchangeRate)
                    console.log('offerPriceETH: ', offerPriceETH)
                    offerPriceETH = offerPriceETH.toString();
                    console.log(offerPriceETH)
                    const decimalPlaces = offerPriceETH.toString().split(".")[1].length
                    console.log(decimalPlaces)
                    // conversion toWei requires exactly 18 or less after commaplaces, this is to be checked
                    if (decimalPlaces > 18) {
                        offerPriceETH = offerPriceETH.slice(0, parseInt(offerPriceETH.indexOf('.')) + 19)
                        console.log(offerPriceETH)
                    }
                    if (decimalPlaces < 18) {
                        offerPriceETH = offerPriceETH.slice(0, parseInt(offerPriceETH.indexOf('.')) + 19)
                        console.log(offerPriceETH)
                    }
                    //offerPriceETH = offerPriceETH * (Math.pow(10, parseInt(decimalPlaces)));
                    console.log(offerPriceETH)
                    //const offerPriceWEI = web3.utils.toWei(offerPriceETH.toString(), 'Ether')
                    console.log("Balance: ", await web3.eth.getBalance(accounts[1]));
                    // write offer price to contract 
                    offerQuotation.writeOfferToContract(parseInt(offerPriceETH), fileHash, contract, clientAddress, accounts[1])
                } else {
                    console.log('ERROR: OFFERPRICE IS NOT DEFINED')
                }
            }, 30 * 1000);

        }
    }
}

//check orders
/* var orders = new Array();
var orderList = new Array();
async function checkOrders() {
    console.log('#################################### SEARCHING FOR NEW ORDERS ####################################')
    orderCount = await contract.methods.orderCount().call()
    console.log('#################################### ', orderCount, ' ORDERS FOUND ####################################')
    for (let i = 1; i <= orderCount; i++) {
        orders[i] = await contract.methods.orders(i).call()
        if (orderList.includes(orders[i].fileHash) == false && accounts.includes(orders[i].provider) == true) {
            console.log('#################################### ORDER: ', orders[i], '####################################')
            console.log('#################################### CLIENT ADRESS: ', orders[i].client, ' ####################################')
            providerAddress = orders[i].provider;
            clientAddress = orders[i].client;
            orderList.push(orders[i].fileHash)
            console.log(orderList)
            console.log(printerManager)
            if (printerManager.sendFileToPrinter(orders[i].fileHash)) {
                printerManager.startPrinter()
            }

        }
    }
    console.log(orders)
} */



setInterval(() => {
    checkForRequests()
  //  checkOrders()
}, 10 * 1000);
// port 3000 is used by dApp Frontend; therefore it is 3001 used here
app.listen(3001, () => console.log('App listening on port 3001!'))
