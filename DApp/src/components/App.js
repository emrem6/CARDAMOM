//import React, { Component } from 'react';
//import Web3 from 'web3';
//import './App.css';
//import PrinterMarketplace from '../abis/PrinterMarketplace.json'
var React = require('react');
var Component = React.Component;
const Web3 = require('web3');
require('./App.css');
const PrinterMarketplace = require('../abis/PrinterMarketplace.json')

//const EventEmitter = require('events');
//const myEmitter = new EventEmitter();
const ipfsClient = require('ipfs-http-client')
const ipfs = ipfsClient({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' }) // leaving out the arguments will default to these values
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
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3
    // Load account
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })
    const networkId = await web3.eth.net.getId()
    const networkData = PrinterMarketplace.networks[networkId]
    if (networkData) {
      const contract = web3.eth.Contract(PrinterMarketplace.abi, networkData.address)
      this.setState({ contract })
      /*       const fileHash = await contract.methods.get().call()
            console.log(fileHash)
            this.setState({ fileHash }) */
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
    } else {
      window.alert('Smart contract not deployed to detected network.')
    }
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
    event.preventDefault()
    console.log("Submitting file to ipfs...")
    ipfs.add(this.state.buffer, (error, result) => {
      console.log('Ipfs result', result)
      if (error) {
        console.error(error)
        return
      }
      this.state.contract.methods.setRequest(result[0].hash).send({ from: this.state.account }).then((r) => {
        return this.setState({ fileHash: result[0].hash })
      })
    })
  }

  purchaseOffer(id, offerPrice, fileHash) {
    this.setState({ loading: true })
    console.log('ID', id,
      'OFFERPRICE', offerPrice,
      'HASH', fileHash,
      'OWNER', offer.owner)
    console.log(fileHash)
    this.state.contract.methods.purchaseOffer(id, offerPrice, this.state.account, offer.provider, fileHash).send({ from: this.state.account, value: offerPrice })
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
                            <td>{window.web3.utils.fromWei(offer.price.toString(), 'ether')} ETH</td>
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
