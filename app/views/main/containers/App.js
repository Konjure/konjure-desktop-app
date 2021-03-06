// @flow
import React, { Component } from 'react';
import { ipcRenderer } from  'electron';
import { Route, Switch } from 'react-router';
import EventEmitter from 'events';

import WindowControls from '../components/controls/WindowControls';
import Navigation from '../components/navigation/Navigation';
import routes from '../constants/routes';
import NodePage from './NodePage';
import GatewayPage from './GatewayPage';
import SettingsPage from './SettingsPage';
import IPFSController from '../ipfs/IPFSController';
import IPFSDaemon from '../ipfs/IPFSDaemon';

const navigation = [
  { name: 'gateway', usable: true, current: true, map: routes.GATEWAY },
  { name: 'node', usable: true, map: routes.NODE },
  { name: 'dashboard', usable: false },
  { name: 'bazaar', usable: false },
  { name: 'hosting', usable: false },
  { name: 'labs', usable: false },
  { name: 'settings', usable: true, map: routes.SETTINGS, noStatus: true }
];

export default class App extends Component {
  constructor() {
    super();

    this.state = {
      alert: null,
      alertLevel: null,
      fadeOut: false
    };

    this.getAlertDiv = this.getAlertDiv.bind(this);
  }

  componentDidMount() {
    global.alertEvents.on('alert-start', (alert, alertLevel = 'success') => {
      this.setState({ alert, alertLevel, fadeOut: false });
    });

    global.alertEvents.on('alert-stop', () => {
      if (this.state.alert !== null) {
        this.setState({ fadeOut: true });
      }
    });
  }

  getAlertDiv() {
    const { alert, alertLevel, fadeOut } = this.state;

    if (alert !== null || fadeOut) {
      const fadeClass = fadeOut ? 'fade-out' : 'fade-in';
      return <div className={`${fadeClass} k-alert ${alertLevel}`}>
        <p>{alert}</p>
      </div>;
    }

    return <div />;
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
        {this.getAlertDiv()}
        <Navigation tabs={navigation}/>
        <Switch>
          <Route path={routes.NODE} component={NodePage}/>
          <Route path={routes.SETTINGS} component={SettingsPage}/>
          <Route path={routes.GATEWAY} component={GatewayPage}/>
        </Switch>
      </div>
    );
  }
}

function initAlerts() {
  let alerting = false;

  const events = new EventEmitter();
  global.alertEvents = events;

  global.alert = (alert, time, level = 'success') => {
    if (alerting) {
      return;
    }

    alerting = true;
    events.emit('alert-start', alert, level);

    setTimeout(() => {
      if (!alerting) {
        return;
      }

      events.emit('alert-stop');
      alerting = false;
    }, time * 1000);
  };
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
    if (process.env.NODE_ENV === 'production') {
      global.startAndBindIPFS();
    } else {
      ipcRenderer.send('ipfs-finish-init');
    }
  } else {
    global.ipfsController.bindAPI(global.ipfsDaemon.getAPI());
  }
}

initAlerts();
initIPFS();
