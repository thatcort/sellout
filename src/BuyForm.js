import React from 'react';
import AgentContractABI from '../build/contracts/Agent.json';
import getWeb3 from './utils/getWeb3';

export default class BuyForm extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      width: 0,
      height: 0,
      quote: 0
    }

    this.handleInputChange = this.handleInputChange.bind(this);
    this.getQuote = this.getQuote.bind(this);
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
  this.setState({quote: quote.toNumber()});
}

  render() {
    return (
    <div>
      <div className="field">
        <label className="label">Width</label>
        <input name="width" className="input" type="number" value={this.state.width} onChange={this.handleInputChange}/>
      </div>
      <div className="field">
        <label className="label">Height</label>
        <input name="height" className="input" type="number" value={this.state.height} onChange={this.handleInputChange}/>
      </div>
      <div>Quote: {this.state.quote}</div>
    </div>
    );
  }


}