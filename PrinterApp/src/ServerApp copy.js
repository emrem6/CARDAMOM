
/* const React = require('react');
const Component = React.Component; */
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
var fileHashList = new Array();
var requests = new Array;
var offerPrice;

let accounts;
let contract;
var fileHash;
var curaValues;
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
        console.log(requests[i].fileHash)
        if (fileHashList.includes(requests[i].fileHash) == false) {
            console.log('NEW REQUEST FOUND - HASH: ', requests[i].fileHash)
            fileHash = requests[i].fileHash;

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
            }, 10 * 1000);


            if (offerPrice > 0) {
                const exchangeRate = exchangeEURinETH.exchangeEURinETH()
                let offerPriceETH = offerPrice / parseFloat(exchangeRate)
                offerPriceETH = offerPriceETH.toString();
                console.log(offerPriceETH)
                const decimalPlaces = offerPriceETH.toString().split(".")[1].length
                console.log(decimalPlaces)
                // conversion toWei requires exactly 18 or less after commaplaces, this is to be checked
                if (decimalPlaces > 18) {
                    offerPriceETH = offerPriceETH.slice(0, parseInt(offerPriceETH.indexOf('.')) + 19)
                    console.log(offerPriceETH)
                }
                const offerPriceWEI = web3.utils.toWei(offerPriceETH.toString(), 'Ether')

                /* const decimalPlaces = offerPriceETH.toString().split(".")[1].length
                            console.log(decimalPlaces)
                            const offerPriceETHconverted = offerPriceETH*(Math.pow(10, parseInt(decimalPlaces)));
                            console.log(offerPriceETH)
                            console.lolg(offerPriceETHconverted)
                            console.log(parseInt(offerPriceETHconverted)) */
                console.log("Balance: ", web3.eth.getBalance(accounts[0]));
                // write offer price to contract 
                offerQuotation.writeOfferToContract(parseInt(offerPriceWEI), contract, accounts[0])

            } else {
                console.log('ERROR: OFFERPRICE IS NOT DEFINED')
            }
        }
    }
}



/* setTimeout(async function offerCreation() {
    // get exchange rate of ETH in EUR to convert offer price into cryptocurrency
    // solidity does not understand floating numbers, hence the price needs to be fixed and converted into a number
    const exchangeRate = await exchangeEURinETH.exchangeEURinETH()
    let offerPriceETH = offerPrice / parseFloat(exchangeRate)
    offerPriceETH = offerPriceETH.toString();
    console.log(offerPriceETH)
    const decimalPlaces = offerPriceETH.toString().split(".")[1].length
    console.log(decimalPlaces)
    // conversion toWei requires exactly 18 or less after commaplaces, this is to be checked
    if (decimalPlaces > 18) {
        offerPriceETH = offerPriceETH.slice(0, parseInt(offerPriceETH.indexOf('.')) + 19)
        console.log(offerPriceETH)
    }
    const offerPriceWEI = web3.utils.toWei(offerPriceETH.toString(), 'Ether')

    /* const decimalPlaces = offerPriceETH.toString().split(".")[1].length
                console.log(decimalPlaces)
                const offerPriceETHconverted = offerPriceETH*(Math.pow(10, parseInt(decimalPlaces)));
                console.log(offerPriceETH)
                console.lolg(offerPriceETHconverted)
                console.log(parseInt(offerPriceETHconverted)) 
    console.log("Balance: ", await web3.eth.getBalance(accounts[0]));
    await offerQuotation.writeOfferToContract(parseInt(offerPriceWEI), contract, accounts[0])
}, 10000) */


/* async function checkOrders() {
    console.log('checking orders')
    await orderProcessing.fetchOrder(contract, accounts[1]);
} */
//0,00573890151446299500
/* new Promise((resolve, reject) => {
    contract.methods.setOfferPrice(100) 
}).then(result => {
    var test =  contract.methods.getOffers().call()
    console.log('######################')
    console.log(test)
    console.log('######################')
}
) */
// app.get('/getfile', function (req, res) {
//     //res.send(file.content.toString('utf8'));
// })
setInterval(() => {
    checkForRequests()
    //checkOrders()
}, 3 * 1000);
// port 3000 is used by dApp Frontend; therefore it is 3001 used here
app.listen(3001, () => console.log('App listening on port 3001!'))
