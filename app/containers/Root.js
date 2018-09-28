// @flow
import App from './App';
import React, {Component} from 'react';
import {Provider} from 'react-redux';
import {ConnectedRouter} from 'react-router-redux';
import type {Store} from '../reducers/types';

const i18n = require('i18n');

type Props = {
  store: Store,
  history: {}
};

export default class Root extends Component<Props> {
  constructor(props) {
    super(props);
    this.configurei18n();
  }

  configurei18n() {
    i18n.configure({
      directory: require('path').join(__dirname, 'languages'),
      objectNotation: true,
      register: global,
      defaultLocale: 'en'
    });
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
