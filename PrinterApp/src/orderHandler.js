const express = require('express');
const app = express();
const path = require('path');
const printerManager = require(path.join(__dirname, 'printerManager.js'));
const PrinterMarketplace = require(path.join(__dirname, '../../DApp/src/abis/PrinterMarketplace.json'));
const Web3 = require('web3');

//const serverApp = require(path.join(__dirname, 'ServerApp.js'));

var clientAddress;
var orders = new Array();
var orderList = new Array();

let contract
let accounts


// initialize contract
init()
async function init() {
    try {
        console.log('STARTING ORDERHANDLER...')
        if (typeof web3 !== 'undefined') {
            web3 = new Web3(web3.currentProvider);
        } else {
            web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:7545'));
        }
        accounts = await web3.eth.getAccounts();
        const id = await web3.eth.net.getId();
        const networkData = PrinterMarketplace.networks[id];
        contract = await new web3.eth.Contract(
            PrinterMarketplace.abi,
            networkData.address);
    }
    catch (error) {
        console.log('ERROR: initialization error')
    }
}



//check orders
async function checkOrders() {
    console.log('#################################### SEARCHING FOR NEW ORDERS ####################################')
    orderCount = await contract.methods.orderCount().call()
    console.log('#################################### ', orderCount, ' ORDERS FOUND ####################################')
    for (let i = 1; i <= orderCount; i++) {
        orders[i] = await contract.methods.orders(i).call()
        if (orderList.includes(orders[i].fileHash) == false && accounts.includes(orders[i].provider) == true) {
            console.log('#################################### STARTING PRINT SERVICE  ####################################')
            console.log('#################################### CLIENT ADRESS: ', orders[i].client, ' ####################################')
            providerAddress = orders[i].provider;
            clientAddress = orders[i].client;
            orderList.push(orders[i].fileHash)
            // console.log(orderList)
            console.log(printerManager)
            setTimeout(() => {
                printerManager.sendFileToPrinter(orders[i].fileHash)
            }, 10 * 1000);
            setTimeout(() => {
                printerManager.startPrinter(orders[i].fileHash)
            }, 10);



        }
    }
    console.log(orders)
}


setInterval(() => {
    checkOrders()
}, 30 * 1000);
app.listen(3003, () => console.log('orderHandler listening on port 3003!'))
