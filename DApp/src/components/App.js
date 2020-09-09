//import React, { Component } from 'react';
//import Web3 from 'web3';
//import './App.css';
//import PrinterMarketplace from '../abis/PrinterMarketplace.json'
var React = require('react');
var Component = React.Component;
const reactrouter = require('react-router-dom');
const HashRouter = reactrouter.HashRouter;
const Route = reactrouter.Route
const Switch = reactrouter.Switch

const Web3 = require('web3');
require('./App.css');
const contractABI = require('../abis/contractABI.json')

//const EventEmitter = require('events');
//const myEmitter = new EventEmitter();
const ipfsClient = require('ipfs-http-client')
const ipfs = ipfsClient({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' }) // leaving out the arguments will default to these values
let contract;
//let contractAddress;
const contractAddress = '0x8285ed4dbfba6faa5bd9da628579239168dd2e06';

const accounts = '0xd41434a7aff05F0BC72AfbE67734A1fE9c63c209'
let web3;
let offer
class App extends Component {

  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
    // await this.listOffers()
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
      web3 = window.web3
      console.log(window.web3.currentProvider)

    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
      console.log(window.web3.currentProvider)
      web3 = window.web3
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }


/*     try {
      const provider = new Web3.providers.HttpProvider("https://ropsten.infura.io/v3/c968bc8207224bbf8eff18c811b31739");
    //const provider = new Web3.providers.HttpProvider("https://ropsten.infura.io/c968bc8207224bbf8eff18c811b31739");
      web3 = new Web3(provider);
      web3.eth.net.isListening()
        .then(() => console.log('web3 is connected'))
        .catch(e => console.log('Something went wrong'));
    }
    catch (error) {
      console.log(error)
    } */
  }




  async loadBlockchainData() {
    
    // console.log(web3)

    // Load account
    //const accounts = await web3.eth.getAccounts()
    console.log(accounts)
    this.setState({ account: accounts })
    //const networkId = await web3.eth.net.getId()
    //const networkData = PrinterMarketplace.networks[networkId]
   //  contractAddress = '0x13d36db04ea386052b6e2ddf407660045220c8f5';
    contract = new web3.eth.Contract(contractABI, contractAddress);
    if (contract) {
      console.log('Contract is initialized')
      console.log(contract)
    }
    else {
      window.alert('Smart contract not deployed to detected network.')
    }
    this.setState({ contract })
    /*       const fileHash = await contract.methods.get().call()
          console.log(fileHash)
          this.setState({ fileHash }) */
          console.log('CONTRACT: ', contract)
          console.log('Methods: ', contract.methods)
    const offerCount = await contract.methods.offerCount().call()
    this.setState({ offerCount })
    // Load offers
    for (var i = 1; i <= offerCount; i++) {
      offer = await contract.methods.offers(i).call()
      console.log('OFFER: ', offer)
      this.setState({
        offers: [...this.state.offers, offer]
      })
    }
    console.log('Offers:', this.state.offers)
    console.log(await contract.methods.requestCount().call())

  }
  // fetch and list all offers from Smart Contract 
  /*   async listOffers() {
      var offers = new Array();l
      offers = await contract.methods.getOffers().call()
      for (i in offers) {
        console.log(offers[i])
      }
  
    }
   */
  constructor(props) {
    super(props)
    this.state = {
      fileHash: '',
      contract: null,
      web3: null,
      buffer: null,
      account: null,
      offerPrice: null,
      offers: []
    }

    this.purchaseOffer = this.purchaseOffer.bind(this)
  }

  captureFile = (event) => {
    event.preventDefault()
    const file = event.target.files[0]
    const reader = new window.FileReader()
    reader.readAsArrayBuffer(file)
    reader.onloadend = () => {
      this.setState({ buffer: Buffer(reader.result) })
      console.log('buffer', this.state.buffer)
    }
  }

  onSubmit = (event) => {
    console.log(this.state.contract.methods)
    event.preventDefault()
    console.log("Submitting file to ipfs...")
    ipfs.add(this.state.buffer, (error, result) => {
      console.log('Ipfs result', result)
      if (error) {
        console.error(error)
        return
      }
      //web3.eth.sendRawTransaction({from: this.state.account, to: contractAddress})
/*       this.state.contract.methods.setRequest(result[0].hash).send({ from: this.state.account }).then((r) => {
        return this.setState({ fileHash: result[0].hash })
      }) */
      contract.methods.setRequest(result[0].hash).send({from: accounts})

    })
  }

  purchaseOffer(id, offerPrice, fileHash) {
    this.setState({ loading: true })
    console.log('ID', id,
      'OFFERPRICE', offerPrice,
      'HASH', fileHash,
      'OWNER', offer.owner)
    console.log(fileHash)
    this.state.contract.methods.purchaseOffer(id, offerPrice, this.state.account, offer.provider, fileHash)
    .send({ from: this.state.account, value: offerPrice })
      .once('receipt', (receipt) => {
        this.setState({ loading: false })
      })
  }
  render() {
    return (
      <div>
        <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
          <a>
            PrinterMarketplace
          </a>
        </nav>
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex text-center">
              <div className="content mr-auto ml-auto">
                <p>&nbsp;</p>
                <h2>Change File</h2>
                <form onSubmit={this.onSubmit} >
                  <input type='file' onChange={this.captureFile} />
                  <input type='submit' />
                </form>
                <p>&nbsp;</p>
                <h2>Offer Listing</h2>
                <table className="table">
                  <thead>
                    <tr>
                      <th scope="col">#</th>
                      <th scope="col">Price</th>
                      <th scope="col">File Hash</th>
                      <th scope="col">Client</th>
                      <th scope="col">Provider</th>
                      <th scope="col"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {
                      this.state.offers.map((offer, key) => {
                        return (
                          <tr key={key}>
                            <td scope="row">{offer.id.toString()}</td>
                            <td>{web3.utils.fromWei(offer.price.toString(), 'ether')} ETH</td>
                            <td>{offer.fileHash}</td>
                            <td>{offer.client.toString()}</td>
                            <td>{offer.provider.toString()}</td>
                            <td>{!offer.purchased
                              ? <button
                                name={offer.id}
                                value={offer.price}
                                onClick={(event) => {
                                  this.purchaseOffer(event.target.name, event.target.value, offer.fileHash)
                                }}
                              >
                                Buy
                  </button>
                              : null
                            }
                            </td>
                          </tr>
                        )
                      })
                    }
                  </tbody>
                </table>
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
