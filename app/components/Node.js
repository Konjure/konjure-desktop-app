// @flow
import React, { Component } from 'react';

const os = require('os');

const { lookupNavItem } = require('./static/sidebar/Navigation');

exports.nodeStatus = false;

export default class Node extends Component {
  static formatOsMem(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

    if (bytes === 0) {
      return '0 Bytes';
    }

    const exp = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${Math.round(bytes / (1024**exp), 2)} ${sizes[exp]}`
  }

  constructor(props) {
    super(props);
    this.toggleNode = this.toggleNode.bind(this);
  }

  toggleNode() {
    const nodeNavitem = lookupNavItem('node');
    if (exports.nodeStatus) {
      exports.nodeStatus = false;
      nodeNavitem.setState({
        status: 'down'
      });
      // Stop IPFS daemon...
    } else {
      exports.nodeStatus = true;
      nodeNavitem.setState({
        status: 'up'
      });
      // Start IPFS daemon...
    }

    this.forceUpdate();
  }

  render() {
    return (
      <div className='k-content node'>
        <div className='k-node-top'>
          <div className='vertical-center-outer'>
            <div className='vertical-center-inner'>
              <h1 className='left'>Konjure Node</h1>
              <label htmlFor='nodeOnOff' className='switch'>
                <input type='checkbox' />
                <span
                  className={`node-slider round ${exports.nodeStatus ? 'color' : ''}`}
                  onClick={() => {this.toggleNode()}}/>
              </label>
              <h4 className='node-status left'>{exports.nodeStatus ? 'ON' : 'OFF'}</h4>
            </div>
          </div>
        </div>
        <div className='k-node-left'>
          <div className='k-slider'>
            <div className='vertical-center-outer'>
              <div className='vertical-center-inner'>
                <h4>CPU & GPU</h4>
                <h6>Select how much available CPU you would like Konjure to use:</h6>
                <br /><br />
                  <div className='slider cpu' />
              </div>
            </div>
          </div>
          <div className='k-slider'>
            <div className='vertical-center-outer'>
              <div className='vertical-center-inner'>
                <h4>MEMORY</h4>
                <h6>
                  Select how much RAM Konjure can use (<span>{Node.formatOsMem(os.totalmem())}</span> total)
                </h6>
                <br />
                <br />
                <div className='slider ram' />
              </div>
            </div>
          </div>
          <div className='k-slider'>
            <div className='vertical-center-outer'>
              <div className='vertical-center-inner'>
                <h4>NETWORK</h4>
                <h6>Select how much of your network you would like Konjure to use:</h6>
                <br /><br />
                  <div className='slider network' />
              </div>
            </div>
          </div>
        </div>
        <div className='k-node-right'>
          <div className='k-slider'>
            <div className='vertical-center-outer'>
              <div className='vertical-center-inner'>
                <input className='display-amount' id='cpu-amount' readOnly />
              </div>
            </div>
          </div>
          <div className='k-slider'>
            <div className='vertical-center-outer'>
              <div className='vertical-center-inner'>
                <input className='display-amount' id='ram-amount' readOnly />
              </div>
            </div>
          </div>
          <div className='k-slider'>
            <div className='vertical-center-outer'>
              <div className='vertical-center-inner'>
                <input className='display-amount' id='network-amount' readOnly />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
