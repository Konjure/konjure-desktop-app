// @flow
import * as React from 'react';
import {Route, Switch} from 'react-router';
import WindowControls from "../components/WindowControls";
import Navigation from "../components/sidebar/Navigation";
import routes from '../constants/routes.json';
import CounterPage from "./CounterPage";
import GatewayPage from "./GatewayPage";

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
