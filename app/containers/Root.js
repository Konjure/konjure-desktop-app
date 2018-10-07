// @flow
import React, {Component} from 'react';
import {Provider} from 'react-redux';
import {ConnectedRouter} from 'react-router-redux';
import App from './App';
import type {Store} from '../reducers/types';

const { configurei18n } = require('../lang/locale');

type Props = {
  store: Store,
  history: {}
};

export default class Root extends Component<Props> {
  constructor(props) {
    super(props);
    configurei18n();
  }

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
