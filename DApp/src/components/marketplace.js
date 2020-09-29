import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import logobosch from '../assets/img/bosch.png';
import logoconnectory from '../assets/img/connectory.png';
import iconETH from '../assets/img/eth.png';
require('./App.css');
var bootstrap = require('react-bootstrap');
var Button = bootstrap.Button;
const Web3 = require('web3');
const config = require('../config.json')
const contractABI = require('../abis/contractABI.json')
const ipfsClient = require('ipfs-http-client')
const ipfs = ipfsClient({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' })
const contractAddress = config.contractAddress;
let contract;
let fileName;
let web3;
let offer;
let request;
class marketplace extends Component {
    async componentWillMount() {
        await this.loadWeb3()
        await this.loadBlockchainData()
    }
    async loadWeb3() {
        if (window.ethereum) {
            window.web3 = new Web3(window.ethereum)
            await window.ethereum.enable()
            web3 = window.web3
        }
        else if (window.web3) {
            window.web3 = new Web3(window.web3.currentProvider)
            web3 = window.web3
        }
        else {
            window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
        }
    }
    async loadBlockchainData() {
        // Load account
        const accounts = await web3.eth.getAccounts()
        this.setState({ account: accounts[0] })
        contract = new web3.eth.Contract(contractABI, contractAddress);
        if (contract) {
            console.log('Contract is initialized')
        }
        else {
            window.alert('Smart contract not deployed to detected network.')
        }
        this.setState({ contract })
        const offerCount = await contract.methods.requestCount().call()
        this.setState({ offerCount })
        // Load offers
        for (var i = 1; i <= offerCount; i++) {
            request = await contract.methods.requests(i).call()
            if (request.client === this.state.account) {
                offer = request
                this.setState({
                    offers: [...this.state.offers, offer]
                })
            }
        }
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
        const reader = new window.FileReader()
        reader.readAsArrayBuffer(file)
        reader.onloadend = () => {
            this.setState({ buffer: Buffer(reader.result) })
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
            contract.methods.setRequest(result[0].hash, fileName).send({ from: this.state.account })
        })
    }

    purchaseOffer(id, offerPrice, fileHash) {
        this.setState({ loading: true })

        const decimalPlaces = offerPrice.split(".")[1].length
        if (decimalPlaces > 18) {
            offerPrice = offerPrice.slice(0, parseInt(offerPrice.indexOf('.')) + 19)
        }
        const offerPriceWEI = web3.utils.toWei(offerPrice, 'Ether')
        this.state.contract.methods.deposit(id, this.state.account, offer.provider, fileHash)
            .send({ from: this.state.account, value: offerPriceWEI })
            .once('receipt', (receipt) => {
                this.setState({ loading: false })
            })
    }
    // once client has received the print he can accept the reception in order to release the transfer of money from escrow to provider 
    acceptReception(id) {
        this.state.contract.methods.withdraw(id).send({ from: this.state.account, gas: 300000 })
    }
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
                                                                disabled={offer.status !== 'offered'}
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
                                                            disabled={offer.status !== 'purchased'}
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
                <footer className="bosch-footer small text-center text-black-50">
                    <div className="container">
                        <div className="row">
                            <div className="col-12 mb-3">
                                <Link to="/impressum">Impressum</Link>
                            </div>
                        </div>
                    </div>
                    <div className="container">Copyright © dapp.cardamom.ninja 2020</div>
                </footer>
            </div >
        );
    }
}
export default marketplace;