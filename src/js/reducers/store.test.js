import { createStore } from 'redux';

import appReducers from './index';
import errors from './errors';
import app from './app';
import query from './query';
import neo4jsettings from './neo4jsettings';
import results from './results';
import user from './user';
import skeleton from './skeleton';
import neuroglancer from './neuroglancer';
import C from './constants';

let store;

function testReducerAction(reducerStateField, reducer, action) {
  store.dispatch(action);
  expect(store.getState()[reducerStateField]).toEqual(reducer(undefined, action));
}

describe('store Creation', () => {
  beforeEach(() => {
    store = createStore(appReducers);
  });
  // check initial state of store
  it('initial store skeleton state is correct', () => {
    expect(store.getState().skeleton).toEqual(skeleton(undefined, {}));
  });
  it('initial store app state is correct', () => {
    expect(store.getState().app).toEqual(app(undefined, {}));
  });
  it('initial store query state is correct', () => {
    expect(store.getState().query).toEqual(query(undefined, {}));
  });
  it('initial store neo4jsettings state is correct', () => {
    expect(store.getState().neo4jsettings).toEqual(neo4jsettings(undefined, {}));
  });
  it('initial store results state is correct', () => {
    expect(store.getState().results).toEqual(results(undefined, {}));
  });
  it('initial store user state is correct', () => {
    expect(store.getState().user).toEqual(user(undefined, {}));
  });
  it('initial store errors state is correct', () => {
    expect(store.getState().errors).toEqual(errors(undefined, {}));
  });
  it('initial store neuroglancer state is correct', () => {
    expect(store.getState().neuroglancer).toEqual(neuroglancer(undefined, {}));
  });
  // check store actions
  // skeleton
  // app
  it('should initialize plugins', () => {
    testReducerAction('app', app, {
      type: C.INIT_PLUGINS,
      pluginList: ['pluginA', 'pluginB']
    });
  });
  it('should initialize view plugins', () => {
    testReducerAction('app', app, { type: C.INIT_VIEWPLUGINS, plugins: { view1: 'view1' } });
  });
  it('should set app database', () => {
    testReducerAction('app', app, { type: C.SET_APP_DB, appDB: 'testDB' });
  });
  it('should set fullscreen viewer', () => {
    testReducerAction('app', app, { type: C.SET_FULLSCREEN_VIEWER });
  });
  it('should clear fullscreen viewer', () => {
    testReducerAction('app', app, { type: C.CLEAR_FULLSCREEN_VIEWER });
  });
  // TODO: add rest of actions
  // query
  // neo4jsettings
  // results
  // user
  // errors
  // neuroglancer
});
