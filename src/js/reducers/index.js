/*
 * Combines all reducers.
<<<<<<< HEAD
*/

import { combineReducers } from 'redux';
import app from './app';
import query from './query';
import neo4jsettings from './neo4jsettings';
import results from './results';
import user from './user';
import skeleton from './skeleton';
import neuroglancer from './neuroglancer';
import errors from './errors';
import notification from './notification';
import visibleColumns from './visibleColumns';
import vimoServer from './vimoserver';

export default combineReducers({
  skeleton,
  app,
  query,
  neo4jsettings,
  results,
  visibleColumns,
  user,
  errors,
  neuroglancer,
  notification,
  vimoServer,
});
