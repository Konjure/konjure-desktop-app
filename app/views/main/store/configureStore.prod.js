// @flow
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { createHashHistory } from 'history';
import { routerMiddleware } from 'react-router-redux';
import rootReducer from '../reducers/index';
import type { stateTypes } from '../reducers/types';

const history = createHashHistory();
const router = routerMiddleware(history);
const enhancer = applyMiddleware(thunk, router);

function configureStore(initialState?: stateTypes) {
  return createStore(rootReducer, initialState, enhancer);
}

export default { configureStore, history };
