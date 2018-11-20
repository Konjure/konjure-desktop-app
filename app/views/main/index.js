/* eslint-disable global-require */
import React from 'react';
import {render} from 'react-dom';
import {AppContainer} from 'react-hot-loader';

import jss from 'jss';
import { JssProvider } from 'react-jss';
import jssNested from 'jss-nested';

import Root from './containers/Root';
import {configureStore, history} from './store/configureStore';
import './app.global.css';

const store = configureStore();

// Jss
jss.use(jssNested());

exports.render = (Renderable) => {
  render(
    <AppContainer>
      <JssProvider>
        <Renderable store={store} history={history}/>
      </JssProvider>
    </AppContainer>,
    document.getElementById('root')
  );
};

exports.render(Root);

if (module.hot) {
  // eslint-disable-next-line global-require
  module.hot.accept(
    './containers/Root',
    () => exports.render(require('./containers/Root'))
  );
}
