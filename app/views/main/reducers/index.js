// @flow
import { combineReducers } from 'redux';
import { routerReducer as router } from 'react-router-redux';

import node from './node/node';
import gateway from './gateway/gateway';

const rootReducer = combineReducers({
  node,
  gateway,
  router
});

export default rootReducer;
