// @flow
import React, { Component } from 'react';
import Slider from '@material-ui/lab/Slider';

const os = require('os');

export default class Node extends Component {
  static formatOsMem(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

    if (bytes === 0) {
      return '0 Bytes';
    }

    const exp = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${Math.round(bytes / (1024 ** exp), 2)} ${sizes[exp]}`;
  }

  constructor(props) {
    super(props);
    this.toggleNode = this.toggleNode.bind(this);

    global.ipfsStatusEvents.on('status-change', () => {
      const status = global.ipfsdStatus;

      if (status === 'down') {
        exports.nodeStatus = false;
      } else {
        exports.nodeStatus = true;
      }

      this.forceUpdate();
    });

    this.state = {};
  }

  toggleNode() {
    const status = global.ipfsdStatus;

    if (status === 'waiting') {
      return;
    }

    if (status === 'up') {
      exports.nodeStatus = false;
      global.ipfsDaemon.stop();
      // Stop IPFS daemon...
    } else {
      exports.nodeStatus = true;
      global.startAndBindIPFS();
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
                <input type='checkbox'/>
                <span
                  className={`node-slider round ${(global.ipfsdStatus !== 'down') ? 'color' : ''}`}
                  onClick={() => {
                    this.toggleNode();
                  }}/>
              </label>
              <h4 className='node-status left'>
                {
                  (function(status) {
                    switch (status) {
                      case 'up':
                        return 'ON';
                      case 'down':
                        return 'OFF';
                      default:
                        return 'WAITING';
                    }
                  })(global.ipfsdStatus)
                }
              </h4>
            </div>
          </div>
        </div>
        <div className='k-node-left'>
          {
            [
              {
                title: 'CPU',
                desc: <h6>Select how much available CPU you would like Konjure to use</h6>,
                min: 0,
                max: 100
              },
              {
                title: 'Memory',
                desc: <h6>Select how much RAM Konjure can use (<span>{Node.formatOsMem(os.totalmem())}</span> total)
                </h6>,
                min: 0,
                max: 16
              }
            ].map((slider) =>
              <div key={slider.title} className='k-slider'>
                <div className='vertical-center-outer'>
                  <div className='vertical-center-inner'>
                    <h4>{slider.title.toUpperCase()}</h4>
                    {slider.desc}
                    <br/><br/>
                    <Slider
                      // eslint-disable-next-line react/destructuring-assignment
                      value={this.state[slider.title] || 0}
                      disabled={exports.nodeStatus}
                      min={slider.min}
                      max={slider.max}
                      className={`slider ${slider.title.toLowerCase()}`}
                      onChange={(evt, value) => {
                        const state = {};
                        state[slider.title] = value;
                        this.setState(state);
                      }}/>
                  </div>
                </div>
              </div>
            )
          }
        </div>
        <div className='k-node-right'>
          <div className='k-slider'>
            <div className='vertical-center-outer'>
              <div className='vertical-center-inner'>
                <input className='display-amount' id='cpu-amount' readOnly/>
              </div>
            </div>
          </div>
          <div className='k-slider'>
            <div className='vertical-center-outer'>
              <div className='vertical-center-inner'>
                <input className='display-amount' id='ram-amount' readOnly/>
              </div>
            </div>
          </div>
          <div className='k-slider'>
            <div className='vertical-center-outer'>
              <div className='vertical-center-inner'>
                <input className='display-amount' id='network-amount' readOnly/>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
