const ipfsAPI = require('ipfs-api');
const express = require('express');
const app = express();
const fs = require('fs');
const https = require('https');
const Web3 = require('web3');
const path = require('path');
const PrinterMarketplace = require(path.join(__dirname, '../DApp/src/abis/PrinterMarketplace.json'));
const cura = require(path.join(__dirname, 'CallCura.js'));
const priceCalculation = require(path.join(__dirname, 'PriceCalculation.js'));
const offerQuotation = require(path.join(__dirname, 'offerQuotation.js'));
const ipfs = ipfsAPI('ipfs.infura.io', '5001', { protocol: 'https' });

var fileHashList = new Array();
var offerPrice;

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
        contract = new web3.eth.Contract(
            PrinterMarketplace.abi,
            networkData.address
            // 0xC42e818413dd07aa2A296469B983077CCA3b9300
            // 0x1917425D47251d58e6596E339658A6D4045d5fA7
        );
    }
    catch (error) {
        console.log('ERROR: initialization error')
    }
}

// in order to build the app, init() must be called to run the constructor function 
init()
// check for new requests
async function checkForRequests() {
    console.log("Searching for new requests..");
    const fileHashSC = await contract.methods.get().call()
    if (fileHashList.includes(fileHashSC) == false) {
        console.log('New request found..')
        fileHashList.push(fileHashSC);
        console.log('Hash of file:', fileHashSC);
        // create a stream to post the file content.
        var printfilepath = "https://ipfs.infura.io/ipfs/" + fileHashSC;
        const printfile = fs.createWriteStream('./files/input/' + fileHashSC + '.stl');
        https.get(printfilepath, function (response) {
            response.pipe(printfile);
        })
        // get file from IPFS
        await ipfs.files.get(fileHashSC, function (err, files) {
            files.forEach((file) => {
                console.log('path:', file.path)
                //console.log(file.content.toString('utf8')) 
                console.log('printfilepath:', printfilepath)
            })
        })
        // run CuraEngine 
        setTimeout(async function runcura() {
            const curaValues = await cura.callCura(fileHashSC);
            console.log(curaValues);
            // run Pricecalculation
            offerPrice = await priceCalculation.calculatePrice(curaValues)
            console.log('######################')
            console.log('offerprice', offerPrice)
            console.log('######################')
        }, 10 * 1000);
        // write offer price to contract
        await offerQuotation.writeOfferToContract(offerPrice, contract, accounts[0])
    }
}
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
}, 3000);
// port 3000 is used by dApp Frontend; therefore it is 3001 used here
app.listen(3001, () => console.log('App listening on port 3001!'))
