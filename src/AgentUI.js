import React from 'react';
import BuyForm from './BuyForm.js';
const BN = require('bn.js');

export default class AgentUI extends React.Component {

  constructor(props) {
    super(props);

    this.handleInputChange = this.handleInputChange.bind(this);
    this.updateAgent = this.updateAgent.bind(this);

    this.state = {};
    this.updateState();
  }



componentDidUpdate(prevProps, prevState, snapshot) {
  if (!this.initted) {
    this.updateState();
  }
}

  async updateState() {
    const {agent, web3} = this.props;
    if (!agent || !web3) {
      return;
    }
    this.initted = true;

    const agentOwner = await agent.owner.call();
    const isOwner = agentOwner === web3.eth.defaultAccount;
    const artist = await agent.artist.call();
    const duration = (await agent.duration.call()).toString();
    const state = {...this.state, isOwner, artist, duration};
    if (isOwner) {
      const commissionPct = (await agent.getCommissionPct.call()).toString();
      const ratePP = (await agent.getArtistRatePP.call()).toString();
      state.commissionPct = commissionPct;
      state.ratePP = ratePP;
    }
    this.setState(state);
  }

  handleInputChange(event) {
    const target = event.target;
    this.setState({[target.name]: target.value});
  }

  async updateAgent() {
    const {agent} = this.props;
    const {artist, duration, commissionPct, ratePP} = this.state;
    const cArtist = await agent.artist.call();
    const cDuration = (await agent.duration.call()).toString();
    const cCommissionPct = (await agent.getCommissionPct.call()).toString();
    const cRatePP = (await agent.getArtistRatePP.call()).toString();
    if (artist !== cArtist || ratePP !== cRatePP) {
      agent.setArtist(artist, new BN(ratePP).toNumber());
    }
    if (duration !== cDuration) {
      agent.setContractDuration(new BN(duration).toNumber());
    }
    if (commissionPct !== cCommissionPct) {
      agent.setCommissionPct(new BN(commissionPct).toNumber());
    }
    this.updateState();
  }

  render() {
    let durationBlock = (
      <div className="columns">
        <div className="column is-one-quarter">Duration (s)</div>
        <div className="column">{this.state.duration}</div>
      </div>
    );
    let ownerBlock = '';
    if (this.state.isOwner) {
      durationBlock = (
        <div className="columns">
          <div className="column is-one-quarter">Duration (s)</div>
          <div className="column">
            <input name="duration" className="input" type="number" value={this.state.duration} min="0" onChange={this.handleInputChange} />
          </div>
        </div>
      );
      ownerBlock = (
        <div>
          <div className="control">
            <label className="label">Commission %</label>
            <input name="commissionPct" className="input" type="number" min="0" max="100" value={this.state.commissionPct} onChange={this.handleInputChange}/>
          </div>
          <div className="field is-grouped">
            <div className="control">
              <label className="label">Artist</label>
              <input name="artist" className="input" type="text" value={this.state.artist} onChange={this.handleInputChange}/>
            </div>
            <div className="control">
              <label className="label">Rate per Pixel</label>
              <input name="ratePP" className="input" type="number" value={this.state.ratePP} min="0" onChange={this.handleInputChange}/>
            </div>
          </div>
          <div className="field">
            <div className="control">
              <button type="button" className="button" onClick={this.updateAgent}>Update Agent</button>
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className="card">
        <div className="card-header">
          <div className="card-header-title">Artist's Agent</div>
        </div>
        <div className="card-content">
          {this.state.isOwner && <h2>Agent Owner Controls</h2>}
          <div className="columns">
            <div className="column is-one-quarter">Artist</div>
            <div className="column">{this.state.artist}</div>
          </div>
          {durationBlock}
          {ownerBlock}
          <div className="has-background-primary" style={{padding: '2em', marginTop: '1em'}}>
            <BuyForm web3={this.props.web3} agent={this.props.agent} buyHandler={this.props.commissionBuyHandler} />
          </div>
        </div>
      </div>
    );
  }
}