// @flow
import React, { Component } from 'react';

import Slider from '@material-ui/lab/Slider';
import { withStyles } from '@material-ui/core/styles';

const os = require('os');

const { __ } = require('../lang/locale');

const memBound = (mem) => ['Bytes', 'KB', 'MB', 'GB', 'TB'][Math.floor(Math.log(mem) / Math.log(1024))];

const formatOsMem = (bytes) => {
  if (bytes === 0) {
    return '0 Bytes';
  }

  return `${maxMem(bytes)} ${memBound(bytes)}`;
};

const maxMem = (bytes) => {
  const exp = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / (1024 ** exp), 2);
};

const sliders =
  [
    {
      title: 'CPU',
      desc: <h6>{__('node.cpu.description')}</h6>,
      min: 5,
      max: 100,
      id: 'cpu-amount',
      format: (val) => `${val.toFixed(0)}%`
    },
    {
      title: 'Memory',
      desc: <h6>{__('node.memory.description', formatOsMem(os.totalmem()))}
      </h6>,
      min: 134217727, // 128mb
      max: os.totalmem(),
      id: 'ram-amount',
      format: (val) => `${maxMem(val)} ${memBound(val)}`
    }
  ];

const StyledSlider = withStyles({
  root: {
    backgroundColor: 'transparent'
  },
  trackBefore: {
    height: '4px',
    backgroundColor: '#7ec31e'
  },
  trackAfter: {
    height: '4px',
    backgroundColor: '#333'
  },
  thumb: {
    width: '20px',
    height: '20px',
    backgroundColor: '#7ec31e',
    borderRadius: '50%',
    border: 'none',
    'box-shadow': '0 0 0 2px rgba(34, 34, 34, 1)',
    cursor: 'pointer'
  }
})(Slider);

let statusIsChanging = false;
let sliderNoopAlerted = false;

export default class Node extends Component {
  constructor(props) {
    super(props);

    this.state = {};

    this.toggleNode = this.toggleNode.bind(this);
    this.statusChangeListener = this.statusChangeListener.bind(this);

    global.ipfsStatusEvents.on('status-change', this.statusChangeListener);
  }

  componentWillUnmount() {
    global.ipfsStatusEvents.removeListener('status-change', this.statusChangeListener);
  }

  statusChangeListener() {
    const status = global.ipfsdStatus;
    exports.nodeStatus = status !== 'down';

    if (status === 'up' || status === 'down') {
      statusIsChanging = false;
    }

    this.forceUpdate();
  }

  toggleNode() {
    if (statusIsChanging) {
      return;
    }

    const status = global.ipfsdStatus;

    if (status === 'waiting') {
      return;
    }

    statusIsChanging = true;

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
              <h1 className='left'>{__('node.title')}</h1>
              <label htmlFor='nodeOnOff' className='switch'>
                <input type='checkbox' checked={global.ipfsdStatus !== 'down'} readOnly/>
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
                        return 'STARTING';
                    }
                  })(global.ipfsdStatus)
                }
              </h4>
            </div>
          </div>
        </div>
        <div className='k-node-left'>
          {
            sliders.map((slider) =>
              <div key={slider.title} className='k-slider'>
                <div className='vertical-center-outer'>
                  <div className='vertical-center-inner'>
                    <h4>{__(`node.${slider.title.toLowerCase()}.title`)}</h4>
                    {slider.desc}
                    <br/><br/>
                    <StyledSlider
                      // eslint-disable-next-line react/destructuring-assignment
                      value={this.state[slider.title] || slider.max}
                      disabled={global.ipfsdStatus !== 'down'}
                      min={slider.min}
                      max={slider.max}
                      className={`slider ${slider.title.toLowerCase()}`}
                      onChange={(evt, value) => {
                        if (!sliderNoopAlerted) {
                          sliderNoopAlerted = true;
                          global.alert(__('node.valueWarning'), 7, 'warning');
                        }
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
          {sliders.map((slider) =>
            <div className='k-slider' key={slider.id}>
              <div className='vertical-center-outer'>
                <div className='vertical-center-inner'>
                  <input className='display-amount' id={slider.id} readOnly value={(() => {
                    const val = this.state[slider.title] || slider.max;
                    return slider.format(val);
                  })()}/>
                </div>
              </div>
            </div>)}
        </div>
      </div>
    );
  }
}
