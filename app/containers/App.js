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

const daemon = new IPFSDaemon();
global.ipfsController = new IPFSController();

daemon.start((err, instance) => {
  if (err) {
    throw err;
  }

  ipcRenderer.send('ipfs-finish-init');
  console.log(`Binding daemon process API to controller API`);
  global.ipfsController.bindAPI(instance);
});

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
