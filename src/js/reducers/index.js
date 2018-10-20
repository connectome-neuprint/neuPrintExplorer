/*
 * Combines all reducers.
*/ 

""; 

import { combineReducers } from 'redux';
import app from './app';
import query from './query';
import neo4jsettings from './neo4jsettings';
import results from './results';
import user from './user';

export default combineReducers({
    app,
    query,
    neo4jsettings,
    results,
    user,
});


