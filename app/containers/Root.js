// @flow
import App from './App';
import React, {Component} from 'react';
import {Provider} from 'react-redux';
import {ConnectedRouter} from 'react-router-redux';
import type {Store} from '../reducers/types';

type Props = {
  store: Store,
  history: {}
};

export default class Root extends Component<Props> {
  render() {
    const { store, history } = this.props;
    return (
      <Provider store={store}>
        <ConnectedRouter history={history}>
          <App />
        </ConnectedRouter>
      </Provider>
    );
  }
}
