const ipfsAPI = require('ipfs-api');
const express = require('express');
const app = express();
const fs = require('fs');
const https = require('https');
const Web3 = require('web3');
const PrinterMarketplace = require('../PrinterMarketplace/src/abis/PrinterMarketplace.json');
//const remixContract = require('../PrinterMarketplace/src/abis/remixContract.json');
//const metadata = JSON.parse(remix.call('fileManager', 'getFile', 'browser/artifacts/PrinterMarketplace.json'));
const path = require('path');
var cura = require(path.join(__dirname, 'CallCura.js'));
var PriceCalculation = require(path.join(__dirname, 'PriceCalculation.js'));
var offerPrice;
//const cura = require(path.join(__dirname, 'CallCura.js'));
//const cura = require('./CallCura.js')
//const pricecalculation = require('./PriceCalculation.js');
const ipfs = ipfsAPI('ipfs.infura.io', '5001', { protocol: 'https' });
//
var fileHashList = new Array();
let contract;
var accounts;
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
        console.log('Accounts: ', accounts)
        const id = await web3.eth.net.getId();
        // console.log('Network ID:', id);
        const networkData = PrinterMarketplace.networks[id];

        // console.log(networkData);
        contract = new web3.eth.Contract(
            PrinterMarketplace.abi,
            networkData.address
            // 0xC42e818413dd07aa2A296469B983077CCA3b9300
            // 0x1917425D47251d58e6596E339658A6D4045d5fA7
        );

        //  let contract = new web3.eth.Contract(metadata.abi)
    }
    catch (error) {
        console.log('ERROR: initialization error')
    }
}

// in order to build the app, init() must be called to run the constructor function 
init()

// check for new requests
var fileHashSC;
var printfilepath;
var curaValues;
var requestFound;
async function checkForRequests() {

    new Promise(async function (resolve, reject) {
        console.log('############# INNER 1 ############');
        console.log("Searching for new requests..");
        fileHashSC = await contract.methods.get().call()
        resolve(fileHashSC)
    }).then(async function (result) {
        if (fileHashList.includes(fileHashSC) == false) {
            requestFound = 1;
            console.log('New request found..')
            fileHashList.push(fileHashSC);
            console.log('Hash of file:', fileHashSC);
            // create a stream to post the file content.
            printfilepath = "https://ipfs.infura.io/ipfs/" + fileHashSC;
            const printfile = fs.createWriteStream('./files/input/' + fileHashSC + '.stl');
            https.get(printfilepath, function (response) {
                response.pipe(printfile);
            })
        }
        else {
            requestFound = 0;
        }
    })
    if (requestFound == 1) {
        new Promise(function (resolve, reject) {
            async function getFileFromIPFS() {
                console.log('############# INNER 2 ############');
                // get file from IPFS
                resolve(await ipfs.files.get(fileHashSC, function (err, files) {
                    files.forEach((file) => {
                        console.log('path:', file.path)
                        //console.log(file.content.toString('utf8')) 
                        console.log('printfilepath:', printfilepath)
                    })
                }))
            }
        })
        new Promise(async function (resolve, reject) {
            console.log('############# INNER 3 ############');

            // run CuraEngine 

            curaValues = await cura.callCura(fileHashSC);
            resolve(curaValues)
            console.log(curaValues);

        }).then(async function (result) {
            // run Pricecalculation
            offerPrice = await PriceCalculation.calculatePrice(curaValues)
            console.log('######################')
            console.log('offerprice', offerPrice)
            console.log('######################')
        }).then(async function (result) {
            //write offerprice to contract
            // await contract.methods.getOffers().call()
            //await contract.methods.setOfferPrice(100).send({from: '0x905134A1c1a08876ec3dE0a64640152b04873a6D'})
            /*   await contract.methods.set('QmSiEYVCY8G7zrc5X8UamkA6TymDyAg8dM39L7qnNFt7tY').send({ from:  '0x905134A1c1a08876ec3dE0a64640152b04873a6D'})
              console.log(await contract.methods.get().call()) */
            //await contract.methods.setOfferPrice('100').send({ from: '0x905134A1c1a08876ec3dE0a64640152b04873a6D' })
            //await contract.methods.getOffers().call()

        }).catch((error) => {
            console.log(error)
        })
        /*  new Promise(async function (resolve, reject) {
             var valu = await contract.methods.getOffers().call()
             resolve(valu)
             console.log(valu)
         }) */
    }
}
setInterval(() => {
    checkForRequests()
}, 5000);
// port 3000 is used by dApp Frontend; therefore it is 3001 used here
app.listen(3001, () => console.log('App listening on port 3001!'))
