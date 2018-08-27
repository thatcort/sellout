import React, { Component } from 'react';
import AgentContractABI from '../build/contracts/Agent.json';
import CommissionContractABI from '../build/contracts/Commission.json';
import getWeb3 from './utils/getWeb3';
import BuyForm from './BuyForm.js';
import CommissionUI from './CommissionUI.js';

import './css/oswald.css';
import './css/open-sans.css';
import './css/pure-min.css';
import './App.css';

class App extends Component {

  contract = require('truffle-contract');

  constructor(props) {
    super(props)

    this.state = {
      agent: null,
      commissions: [],
      web3: null
    }
  }

  componentWillMount() {
    // Get network provider and web3 instance.
    // See utils/getWeb3 for more info.

    getWeb3
    .then(results => {
      this.setState({
        web3: results.web3
      })

      // Instantiate contract once web3 provided.
      this.instantiateContract()
    })
    .catch((e) => {
      console.log(e);
    })
  }

  instantiateContract() {
    // console.log(Object.keys(AgentContractABI));

    const agentContract = this.contract(AgentContractABI);
    agentContract.setProvider(this.state.web3.currentProvider);

    let agent;

    // Get accounts.
    this.state.web3.eth.getAccounts((error, accounts) => {
      const { web3 } = this.state;
      web3.eth.defaultAccount = accounts[0];
      this.setState({web3});
      agentContract.deployed().then(instance => {
        agent = instance;
        agent.CommissionCreated().watch((error, result) => {
          console.log(error || result);
        });
        this.setState({agent});
        return this.loadCommissions();
      });
    });
  }

  async loadCommissions() {
    const commissionContract = this.contract(CommissionContractABI);
    commissionContract.setProvider(this.state.web3.currentProvider);
    const addresses = await this.state.agent.getMyCommissions.call();
    console.log(addresses);
    const commissions = await Promise.all(addresses.map(a => commissionContract.at(a)));
    console.log(commissions);
    this.setState({commissions});
  }

  commissionBuyHandler(bought) {
    let {commissions} = this.state;
    commissions = [...commissions, bought];
    this.setState({commissions})
  }


  render() {
    return (
      <div className="App">
        <div>Current Account: {this.state.web3 && this.state.web3.eth.defaultAccount}</div>

        {/* <nav className="navbar pure-menu pure-menu-horizontal">
            <a href="#" className="pure-menu-heading pure-menu-link"></a>
        </nav> */}

        <BuyForm web3={this.state.web3} agent={this.state.agent} buyHandler={this.commissionBuyHandler.bind(this)} />

        <h2>Your Artworks</h2>
        {this.state.commissions.map((c, i) => <CommissionUI commission={c} key={i}></CommissionUI>)}
      </div>
    );
  }
}

export default App
