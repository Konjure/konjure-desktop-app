// @flow
import React, { Component } from 'react';
import { Route, Switch } from 'react-router';
import WindowControls from '../components/static/WindowControls';
import Navigation from '../components/static/sidebar/Navigation';
import routes from '../constants/routes';
import CounterPage from './NodePage';
import GatewayPage from './GatewayPage';
import IPFSController from '../ipfs/IPFSController';
import IPFSDaemon from '../ipfs/IPFSDaemon';

const { ipcRenderer } = require('electron');

const EventEmitter = require('events');

initIPFS();

const navigation = [
  { name: 'gateway', usable: true, current: true, map: routes.GATEWAY },
  { name: 'node', usable: true, map: routes.NODE },
  { name: 'dashboard', usable: false },
  { name: 'bazaar', usable: false },
  { name: 'hosting', usable: false },
  { name: 'labs', usable: false }
];

export default class App extends Component {
  render() {
    return (
      <div onDragOver={event => {
        event.preventDefault();
        return false;
      }} onDrop={event => {
        event.preventDefault();
        return false;
      }}>
        <WindowControls/>
        <Navigation tabs={navigation}/>
        <Switch>
          <Route path={routes.NODE} component={CounterPage}/>
          <Route path={routes.GATEWAY} component={GatewayPage}/>
        </Switch>
      </div>
    );
  }
}

function initIPFS() {
  global.ipfsDaemon = new IPFSDaemon();
  global.ipfsController = new IPFSController();

  global.startAndBindIPFS = function() {
    global.ipfsDaemon.start((err, instance) => {
      if (err) {
        throw err;
      }

      ipcRenderer.send('ipfs-finish-init');
      console.log(`Binding daemon process API to controller API`);
      global.ipfsController.bindAPI(instance);
    });
  };

  global.ipfsStatusEvents = new EventEmitter();
  global.ipfsDaemon.on('post-start', () => {
    global.ipfsdStatus = 'up';
    global.ipfsStatusEvents.emit('status-change');
  });

  global.ipfsDaemon.on('pre-start', () => {
    global.ipfsdStatus = 'starting';
    global.ipfsStatusEvents.emit('status-change');
  });

  global.ipfsDaemon.on('stopped', () => {
    global.ipfsdStatus = 'down';
    global.ipfsStatusEvents.emit('status-change');
  });

  global.ipfsdStatus = 'down';
  global.ipfsStatusEvents.emit('status-change');

  if (!global.ipfsDaemon.running()) {
    global.startAndBindIPFS();
  } else {
    global.ipfsController.bindAPI(global.ipfsDaemon.getAPI());
  }
}
