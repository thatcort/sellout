import React from 'react';
import BuyForm from './BuyForm.js';
const BN = require('bn.js');


export default class AgentUI extends React.Component {

  PURCHASE_TAB = 'purchase';
  DETAILS_TAB = 'details';
  ADMIN_TAB = 'admin';

  constructor(props) {
    super(props);

    this.handleInputChange = this.handleInputChange.bind(this);
    this.updateAgent = this.updateAgent.bind(this);
    this.setTab = this.setTab.bind(this);

    this.state = {tab: this.PURCHASE_TAB};
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

  setTab(tab = this.PURCHASE_TAB) {
    this.setState({tab});
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

  detailsBlock() {
    // let durationBlock = (
    //   <div className="columns">
    //     <div className="column is-one-quarter">Expiry</div>
    //     <div className="column">{this.state.duration} seconds</div>
    //   </div>
    // );
    return (
      <table class="table">
      <tbody>
        <tr>
          <td>Artist</td>
          <td>{this.state.artist}</td>
        </tr>
        <tr>
          <td>Commission Broker</td>
          <td>{this.props.agent && this.props.agent.address}</td>
        </tr>
        <tr>
          <td>Commission Expiry</td>
          <td>{this.state.duration} seconds</td>
        </tr>
      </tbody>
    </table>
    );
    // <div className="columns">
    //   <div className="column is-one-quarter">Artist</div>
    //   <div className="column">{this.state.artist}</div>
    // </div>
    // <div className="columns">
    //   <div className="column is-one-quarter">Agent</div>
    //   <div className="column">{this.props.agent && this.props.agent.address}</div>
    // </div>
    // {durationBlock}
  }

  adminBlock() {
    if (!this.state.isOwner) {
      return '';
    }
    return (
      <div>
        <div className="control">
          <label className="label">Agent Commission %</label>
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
        <div className="control">
          <label className="label">Duration (seconds)</label>
          <input name="duration" className="input" type="number" value={this.state.duration} min="0" onChange={this.handleInputChange} />
        </div>
        <div className="field">
          <div className="control">
            <button type="button" className="button" onClick={this.updateAgent}>Update Agent</button>
          </div>
        </div>
      </div>
    );
  }

  render() {
    return (
      <div>
        <h1 style={{marginBottom: '0.3em'}}>Commission a New Artwork</h1>

        <div className="tabs">
          <ul>
            <li className={this.state.tab === this.PURCHASE_TAB ? 'is-active' : ''}><a onClick={e => this.setState({tab: this.PURCHASE_TAB})}>Purchase</a></li>
            <li className={this.state.tab === this.DETAILS_TAB ? 'is-active' : ''}><a onClick={e => this.setState({tab: this.DETAILS_TAB})}>Details</a></li>
            <li className={this.state.tab === this.ADMIN_TAB ? 'is-active' : ''}><a onClick={e => this.setState({tab: this.ADMIN_TAB})}>Admin</a></li>
          </ul>
        </div>

        {this.state.tab === this.PURCHASE_TAB && (
          <BuyForm web3={this.props.web3} agent={this.props.agent} buyHandler={this.props.commissionBuyHandler} />  
        )}

        {this.state.tab === this.DETAILS_TAB && this.detailsBlock()}
        
        {this.state.tab === this.ADMIN_TAB && this.adminBlock()}
      </div>
    );
  }
}