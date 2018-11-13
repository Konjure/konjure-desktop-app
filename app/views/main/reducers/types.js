import type { Dispatch as ReduxDispatch, Store as ReduxStore } from 'redux';

export type stateTypes = {
  +counter: number,
  +site: string
};

export type Action = {
  +type: string
};

export type GetState = () => stateTypes;

export type Dispatch = ReduxDispatch<Action>;

export type Store = ReduxStore<GetState, Action>;
