import React, {Component} from 'react';
//const Web3 = require('web3'); 
//require ('./App.css');
//const PrinterMarketplace = require('../abis/PrinterMarketplace.json')
import Web3 from 'web3'; 
import './App.css';
import PrinterMarketplace from '../abis/PrinterMarketplace.json'

const ipfsClient = require('ipfs-http-client')
const ipfs = ipfsClient({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' }) // leaving out the arguments will default to these values
class App extends Component {

  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
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
      const memeHash = await contract.methods.get().call()
      this.setState({ memeHash })
    } else {
      window.alert('Smart contract not deployed to detected network.')
    }
  }

  constructor(props) {
    super(props)

    this.state = {
      memeHash: '',
      //QmPQfUw8XKA8JxGVXFcC39qCbaPULz5TUANi4jdBKou6jt
      contract: null,
      web3: null,
      buffer: null,
      account: null
    }
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
      this.state.contract.methods.set(result[0].hash).send({ from: this.state.account }).then((r) => {
        return this.setState({ memeHash: result[0].hash})
      })
    })
  }

  onClick = (event) => {
    //event.preventDefault()
    console.log("Downloading File...")
    const cid = 'QmPQfUw8XKA8JxGVXFcC39qCbaPULz5TUANi4jdBKou6jt'
    const file = ipfs.get(cid)
    console.log(file.path)
  }

  render() {
    return (
      <div>
        <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
          <a
            className="navbar-brand col-sm-3 col-md-2 mr-0"
            href="http://www.bosch.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            PrinterMarketplace
          </a>
        </nav>
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex text-center">
              <div className="content mr-auto ml-auto">
                <a
                  href="http://www.bosch.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img src={`https://ipfs.infura.io/ipfs/${this.state.memeHash}`} />
                </a>
                <p>&nbsp;</p>
                <h2>Change File</h2>
                <form onSubmit={this.onSubmit} >
                  <input type='file' onChange={this.captureFile} />
                  <input type='submit' />
                </form>
                <p>&nbsp;</p>
                <form onClick={this.onClick} >
                  <input type='button' value='Download File' />
                </form>

              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
