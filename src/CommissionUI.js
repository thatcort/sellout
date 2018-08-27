import React from 'react';
// import CommissionContractABI from '../build/contracts/Commission.json';

import './css/componentUI.css';

const bs58 = require('bs58');

export default class CommissionUI extends React.Component {

  stateNames = [
    'CREATED',
    'FUNDED',
    'STARTED',
    'READY',
    'REFUNDED'
  ]

  stateDescriptions = [
    'Commission needs to be funded before the artist will start the work',
    'Waiting for the artist to complete the work',
    'The artist has started creating the work',
    'The artwork is complete',
    'The funds have been refunded'
  ]

  constructor(props) {
    super(props);

    console.log('CommissionUI: ' + props.commission);

    this.state = {};
    this.updateState();
  }

  async updateState() {
    const {commission} = this.props;
    const results = await Promise.all([
      commission.state.call(),
      commission.width.call(),
      commission.height.call(),
      commission.price.call(),
      commission.artist.call(),
      commission.deadline.call()
    ]);
    const state = results[0].toNumber();
    const hasLocation = state === 3; // READY
    let location = null, locationURL = null;
    if (hasLocation) { // READY
      location = await commission.getArtLocation.call();
      locationURL = this.getLocationURL(location);
    }
    this.setState({
      state,
      width: results[1].toString(10),
      height: results[2].toString(10),
      price: results[3].toString(10),
      artist: results[4],
      deadline: results[5].toNumber() * 1000,
      location,
      locationURL
    });
  }

  getIpfsHashFromBytes32(bytes32Hex) {
    // Add our default ipfs values for first 2 bytes:
    // function:0x12=sha2, size:0x20=256 bits
    // and cut off leading "0x"
    const hashHex = "1220" + bytes32Hex.slice(2)
    const hashBytes = Buffer.from(hashHex, 'hex');
    const hashStr = bs58.encode(hashBytes)
    return hashStr
  }

  getLocationURL(location) {
    const hash = this.getIpfsHashFromBytes32(location);
    return 'https://ipfs.io/ipfs/' + hash;
  }

  render() {
    if (!this.state.width) {
      return <div></div>;
    }
    return (
      <div className="card">
        <div className="card-header">
          <div className="card-header-title">{this.stateNames[this.state.state]} - {this.stateDescriptions[this.state.state]}</div>
        </div>
        <div className="card-content">
          <div className="columns">
            <div className="column">Size</div>
            <div className="column">{this.state.width} x {this.state.height}</div>
          </div>
          <div className="columns">
            <div className="column">Price</div>
            <div className="column">{this.state.price}</div>
          </div>
          <div className="columns">
            <div className="column">Deadline</div>
            <div className="column">{Date(this.state.deadline)}</div>
          </div>
          <div className="columns">
            <div className="column">Location</div>
            <div className="column"><a href={this.state.locationURL}>{this.state.locationURL}</a></div>
          </div>
        </div>
      </div>
    );
  }
}