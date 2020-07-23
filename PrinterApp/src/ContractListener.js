var optionsABI = require('../PrinterMarketplace/src/abis/PrinterMarketplace.json');
var contractAddress = "0x1917425D47251d58e6596E339658A6D4045d5fA7"



var Web3 = require('web3');

if (typeof web3 !== 'undefined') {
  web3 = new Web3(web3.currentProvider);
} else {
  // set the provider you want from Web3.providers
  web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:7545"));
}

console.log("Eth Node Version: ", web3.version.node);
//console.log("Network: " ,web3.version.network, web3.version.ethereum);
//console.log("Connected: ", web3.isConnected(), web3.currentProvider);
//console.log("syncing: ", web3.eth.syncing, ", Latest Block: ",web3.eth.blockNumber);
//console.log("Accounts[0]: " , web3.eth.accounts[0], ":",web3.eth.getBalance(web3.eth.accounts[0]).toNumber())

OptionsContract = initContract(optionsABI, contractAddress)



function initContract(contractAbi, contractAddress) {
    const contract = new web3.eth.Contract(
        PrinterMarketplace.abi,
        networkData.address
        // 0xC42e818413dd07aa2A296469B983077CCA3b9300
        // 0x1917425D47251d58e6596E339658A6D4045d5fA7
    );
  var MyContract = web3.eth.contract(contractAbi);
  var contractInstance = MyContract.at(contractAddress);
  var event = contractInstance.allEvents()
  console.log("listening for events on ", contractAddress)
  // watch for changes
  event.watch(function(error, result){ //This is where events can trigger changes in UI
    if (!error)
      console.log(result);
  });
  return contractInstance
}
