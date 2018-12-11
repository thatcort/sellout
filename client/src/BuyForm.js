import React from 'react';
import CommissionContractABI from './contracts/Commission.json';

export default class BuyForm extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      width: 100,
      height: 100,
      quote: '0'
    }

    this.handleInputChange = this.handleInputChange.bind(this);
    this.getQuote = this.getQuote.bind(this);
    this.buy = this.buy.bind(this);
  }

  handleInputChange(event) {
    const target = event.target;
    this.setState({[target.name]: target.value});
    this.getQuote();
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    this.getQuote();
  }

  async getQuote() {
    const { agent } = this.props;
    if (!agent) {
      return 0;
    }
    const { width, height } = this.state;
    const quote = await agent.getQuote.call(width, height);
    this.setState({quote: quote.toString(10)});
    return quote;
  }

  async buy() {
    const { agent, buyHandler, web3 } = this.props;
    const { width, height } = this.state;

    const contract = require('truffle-contract');
    const commissionContract = contract(CommissionContractABI);
    commissionContract.setProvider(this.props.web3.currentProvider);

    try {
      const quote = await this.getQuote();
      const result = await agent.commissionArt(width, height, {value: quote, from: web3.eth.defaultAccount});
      const logs = result.logs.filter(item => item.event === 'CommissionCreated');
      const c = await commissionContract.at(logs[0].args.commission);
      buyHandler(c);
    } catch (e) {
      console.log('Problem commissioning art: ' + e);
    }
  }

  render() {
    return (
    <div>
      <div className="field is-grouped">
        <div className="control">
          <label className="label">Width</label>
          <input name="width" className="input" type="number" value={this.state.width} min="1" max="65535" onChange={this.handleInputChange}/>
        </div>
        <div className="control">
          <label className="label">Height</label>
          <input name="height" className="input" type="number" value={this.state.height} min="1" max="65535" onChange={this.handleInputChange}/>
        </div>
      </div>
      <div>Price: {this.props.web3 && this.props.web3.utils.fromWei(this.state.quote, 'ether')} ether</div>
      <div className="field">
        <div className="control">
          <button type="button" className="button is-primary" disabled={this.state.width <= 0 || this.state.height <= 0} onClick={this.buy}>Commission Artwork</button>
        </div>
      </div>
    </div>
    );
  }


}