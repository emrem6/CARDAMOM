//import React, { Component } from 'react';
//import Web3 from 'web3';
//import './App.css';
//import PrinterMarketplace from '../abis/PrinterMarketplace.json'
import logobosch from '../assets/img/bosch.png';
import logoconnectory from '../assets/img/connectory.png';
import iconETH from '../assets/img/eth.png';

var React = require('react');
var bootstrap = require('react-bootstrap');

var Component = React.Component;
var Button = bootstrap.Button;

const reactrouter = require('react-router-dom');
const HashRouter = reactrouter.HashRouter;
const Route = reactrouter.Route
const Switch = reactrouter.Switch
const Web3 = require('web3');
require('./App.css');

const config = require('../config.json')
const contractABI = require('../abis/contractABI.json')

//const EventEmitter = require('events');
//const myEmitter = new EventEmitter();
const ipfsClient = require('ipfs-http-client')
const ipfs = ipfsClient({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' }) // leaving out the arguments will default to these values



let contract;
let fileName;
const contractAddress = config.contractAddress;

//const account = config.account;
let web3;
let offer;
let request;
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


    // Load account
    const accounts = await web3.eth.getAccounts()
    console.log(accounts)
    this.setState({ account: accounts[0] })
    console.log(this.state.account)

  
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
    const offerCount = await contract.methods.requestCount().call()
    this.setState({ offerCount })
    // Load offers
    for (var i = 1; i <= offerCount; i++) {
      request = await contract.methods.requests(i).call()
      if (request.client == this.state.account) {
        offer = request
        console.log('OFFER: ', offer)
        this.setState({
          offers: [...this.state.offers, offer]
        })
      }


    }
    console.log('Offers:', this.state.offers)
    console.log(await contract.methods.requestCount().call())

  }
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
    fileName = file.name;
    console.log(file.name)
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
      console.log('ACCOUNT', this.state.account)
      contract.methods.setRequest(result[0].hash, fileName).send({ from: this.state.account })

    })
  }

  purchaseOffer(id, offerPrice, fileHash) {
    this.setState({ loading: true })

    const decimalPlaces = offerPrice.split(".")[1].length
    if (decimalPlaces > 18) {
      offerPrice = offerPrice.slice(0, parseInt(offerPrice.indexOf('.')) + 19)
      console.log('OFFERPRICE IN ETH (prepared): ', offerPrice)
    }
    const offerPriceWEI = web3.utils.toWei(offerPrice, 'Ether')
    console.log('ID', id,
      'OFFERPRICE', offerPrice,
      'OfferPriceWEI', offerPriceWEI,
      'HASH', fileHash,
      'OWNER', offer.owner)
    console.log(fileHash)
    this.state.contract.methods.deposit(id, this.state.account, offer.provider, fileHash)
      .send({ from: this.state.account, value: offerPriceWEI })
      .once('receipt', (receipt) => {
        this.setState({ loading: false })
      })
  }
  // once client has received the print he can accept the reception in order to release the transfer of money from escrow to provider 
  acceptReception(id) {
    console.log('ID', id)
    this.state.contract.methods.withdraw(id).send({ from: this.state.account, gas: 300000 })
  }
  
  /*   acceptReception(id, offerPrice) {
      const decimalPlaces = offerPrice.split(".")[1].length
      if (decimalPlaces > 18) {
        offerPrice = offerPrice.slice(0, parseInt(offerPrice.indexOf('.')) + 19)
        console.log('OFFERPRICE IN ETH (prepared): ', offerPrice)
      }
      const offerPriceWEI = web3.utils.toWei(offerPrice, 'Ether')
      this.state.contract.methods.transferMoney(id)
        .send({ from: this.state.account, value: offerPriceWEI })
        .once('receipt', (receipt) => {
          this.setState({ loading: false })
        })
    } */
  //                             <td>{web3.utils.fromWei(offer.price.toString(), 'ether')} ETH</td>

  render() {
    return (

      <div>
        <div id="bosch-banner">
        </div>
        <nav className="startpage navbar navbar-dark top bg-light flex-md-nowrap shadow">
          <a>
            <h5> Decentralized marketplace for 3D printing - Economy of Things Project @ Bosch </h5>
          </a>
          <a>
            <h5>{this.state.account}</h5>
          </a>
        </nav>
        <div className="container-fluid mt-5">
          <div>
            <img src={logobosch} align="right" alt="logo"></img>
            <img src={logoconnectory} align="left" alt="logo" style={{ width: "200px" }}></img>
          </div>
        </div>
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex text-center">
              <div className="content mr-auto ml-auto">
                <p>&nbsp;</p>
                <h2>Upload file</h2>
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
                      <th scope="col">File Name</th>
                      <th scope="col">Price<img src={iconETH} alt="iconETH" style={{ width: 16, height: 16 }}></img></th>
                      <th scope="col">File Hash</th>
                      <th scope="col">Provider</th>
                      <th scope="col">Status</th>
                      <th scope="col"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {
                      this.state.offers.map((offer, key) => {
                        return (
                          <tr key={key}>
                            <td scope="row">{offer.id.toString()}</td>
                            <td>{offer.fileName}</td>
                            <td>{offer.price} ETH</td>
                            <td>{offer.fileHash}</td>
                            <td>{offer.provider.toString()}</td>
                            <td>{offer.status}</td>
                            <td>{!offer.purchased
                              ? <Button
                                variant="primary"
                                name={offer.id}
                                value={offer.price}
                                disabled={offer.status != 'offered'}
                                onClick={(event) => {
                                  this.purchaseOffer(event.target.name, event.target.value, offer.fileHash)
                                }}
                              >
                                Buy
                  </Button>
                              : null
                            }
                            </td>
                            <td>{<Button
                              variant="secondary"
                              name={offer.id}
                              value={offer.price}
                              disabled={offer.status != 'purchased'}
                              onClick={(event) => {
                                this.acceptReception(event.target.name, event.target.value)
                              }}
                            >
                              Transfer
                  </Button>
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
