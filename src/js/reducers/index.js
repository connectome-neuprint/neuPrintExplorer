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
import errors from './errors';
import notification from './notification';
import visibleColumns from './visibleColumns';
import vimoServer from './vimoserver';
import skeleton from './3Dviewer';

export default combineReducers({
  skeleton,
  app,
  query,
  neo4jsettings,
  results,
  visibleColumns,
  user,
  errors,
  notification,
  vimoServer,
});
