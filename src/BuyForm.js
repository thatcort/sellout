import React from 'react';
import CommissionContractABI from '../build/contracts/Commission.json';

export default class BuyForm extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      width: 0,
      height: 0,
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
    const { agent, buyHandler } = this.props;
    const { width, height } = this.state;

    const contract = require('truffle-contract');
    const commissionContract = contract(CommissionContractABI);
    commissionContract.setProvider(this.props.web3.currentProvider);

    try {
      const quote = await this.getQuote();
      const result = await agent.commissionArt(width, height, {value: quote});
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
      <h2>Commission a New Artwork</h2>
      <div className="field is-grouped">
        <div className="control">
          <label className="label">Width</label>
          <input name="width" className="input" type="number" value={this.state.width} onChange={this.handleInputChange}/>
        </div>
        <div className="control">
          <label className="label">Height</label>
          <input name="height" className="input" type="number" value={this.state.height} onChange={this.handleInputChange}/>
        </div>
      </div>
      <div>Quote: {this.state.quote}</div>
      <div className="field">
        <div className="control">
          <button type="button" className="button" disabled={this.state.width <= 0 || this.state.height <= 0} onClick={this.buy}>Commission Artwork</button>
        </div>
      </div>
    </div>
    );
  }


}