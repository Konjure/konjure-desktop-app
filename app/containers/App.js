// @flow
import * as React from 'react';
import {Route, Switch} from 'react-router';
import WindowControls from "../components/WindowControls";
import Navigation from "../components/sidebar/Navigation";
import routes from '../constants/routes.json';
import CounterPage from "./CounterPage";
import HomePage from "./HomePage";

export default class App extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <WindowControls/>
        <Navigation tabs={[
          {name: 'Gateway', description: 'Upload your site', usable: true, current: true, map: routes.GATEWAY},
          {name: 'Node', description: 'Peer-to-peer network', usable: true, map: routes.NODE},
          {name: 'Dashboard', description: 'Manage your site', usable: false},
          {name: 'Bazaar', description: 'Plugin marketplace', usable: false},
          {name: 'Hosting', description: 'Usage and billing', usable: false},
          {name: 'Labs', description: 'Development kit', usable: false}
        ]}/>
        <Switch>
          <Route path={routes.NODE} component={CounterPage}/>
          <Route path={routes.GATEWAY} component={HomePage}/>
        </Switch>
      </div>
    );
  }
}
