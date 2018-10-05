// @flow
import * as React from 'react';
import {Route, Switch} from 'react-router';
import WindowControls from "../components/static/WindowControls";
import Navigation from "../components/static/sidebar/Navigation";
import routes from '../constants/routes.json';
import CounterPage from "./CounterPage";
import GatewayPage from "./GatewayPage";
import IPFSController from "../ipfs/IPFSController";
import IPFSDaemon from "../ipfs/IPFSDaemon";

const ipcRenderer = require('electron').ipcRenderer;
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

export default class App extends React.Component {
  constructor(props) {
    super(props);
  }

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
        <Navigation tabs={[
          {name: 'gateway', usable: true, current: true, map: routes.GATEWAY},
          {name: 'node', usable: true, map: routes.NODE},
          {name: 'dashboard', usable: false},
          {name: 'bazaar', usable: false},
          {name: 'hosting', usable: false},
          {name: 'labs', usable: false}
        ]}/>
        <Switch>
          <Route path={routes.NODE} component={CounterPage}/>
          <Route path={routes.GATEWAY} component={GatewayPage}/>
        </Switch>
      </div>
    );
  }
}
