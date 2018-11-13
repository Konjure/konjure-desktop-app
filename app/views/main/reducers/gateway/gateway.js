import { SET_SITE_PATH } from '../../actions/gateway/gateway';
import type { Action } from '../types';

const defaultState = {
  site: null
};

export default function gateway(state, action: Action) {
  switch (action.type) {
    case SET_SITE_PATH:
      return {
        site: action.page
      };
    default:
      return defaultState;
  }
}
