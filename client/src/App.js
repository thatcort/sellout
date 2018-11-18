import React, { Component } from 'react';
import AgentContractABI from './contracts/Agent.json';
import CommissionContractABI from './contracts/Commission.json';
import getWeb3 from './utils/getWeb3';
import CommissionUI from './CommissionUI.js';
import AgentUI from './AgentUI.js';
import truffleContract from "truffle-contract";
// import SimpleStorageContract from "./contracts/SimpleStorage.json";

import './css/oswald.css';
import './css/open-sans.css';
import './css/pure-min.css';
import './App.css';

class App extends Component {

  constructor(props) {
    super(props)

    this.state = {
      agent: null,
      commissions: [],
      web3: null
    }
  }

  async componentWillMount() {
    // Get network provider and web3 instance.
    // See utils/getWeb3 for more info.

    
  }

  async componentDidMount() {
    try {
      const web3 = await getWeb3();
      const accounts = await web3.eth.getAccounts();


// const Contract = truffleContract(SimpleStorageContract);
//       Contract.setProvider(web3.currentProvider);
//       const instance = await Contract.deployed();



      web3.eth.defaultAccount = accounts[0];

      const agentContract = truffleContract(AgentContractABI);
      agentContract.setProvider(web3.currentProvider);
      const agent = await agentContract.deployed();

      const commissionContract = truffleContract(CommissionContractABI);
      commissionContract.setProvider(web3.currentProvider);

      this.setState({ web3, agent, commissionContract });

      this.timerID = setInterval(() => this.loadCommissions(), 10000);
    } catch (error) {
      // Catch any errors for any of the above operations.
      // alert(`Failed to load web3, accounts, or contract. Check console for details.`);
      console.log(error);
    }



  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  async loadCommissions() {
    const addresses = await this.state.agent.getMyCommissions.call();
    console.log(addresses);
    const commissions = await Promise.all(addresses.map(a => this.state.commissionContract.at(a)));
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
        <section>
          <div>Current Account: {this.state.web3 && this.state.web3.eth.defaultAccount}</div>
        </section>

        <section>
          <AgentUI web3={this.state.web3} agent={this.state.agent} commissionBuyHandler={this.commissionBuyHandler.bind(this)} />
        </section>

        <section>
          <h1>Your Artworks</h1>
          <div className="commissions">
            {this.state.commissions.map((c, i) => <CommissionUI commission={c} key={i}></CommissionUI>)}
          </div>
        </section>
      </div>
    );
  }
}

export default App
