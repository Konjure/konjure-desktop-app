import * as Actions from '../../actions/node/node';
import type { Action } from '../types';

const os = require('os');

const defaultState = {
  cpu: 100,
  memory: os.totalmem()
};

export default function node(state, action: Action) {
  if (state === undefined) {
    return defaultState;
  }

  switch (action.type) {
    case Actions.SET_CPU_AMOUNT:
      return {
        memory: state.memory,
        cpu: action.amount
      };
    case Actions.SET_MEMORY_AMOUNT:
      return {
        cpu: state.cpu,
        memory: action.amount
      };
    default:
      return state;
  }
}
