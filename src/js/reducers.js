"use strict"; 

//var Redux = require('redux');                                                                       
var initialQueryState = {
    neoQuery: "",
    neoResults: null,
    isQuerying: false,
    pluginList: []
};

/*
 * Manage state for queries.
*/
var queryReducer = function(state, action) {
    if(state === undefined) {
        return initialQueryState;
    }

    switch(action.type) {
        case 'INIT_PLUGINS': {
            return Object.assign({}, state, {pluginList: action.pluginList});
        }
        case 'SET_QUERY_TYPE': {
            return Object.assign({}, state, {queryType: action.QueryType});
        }
        case 'UPDATE_QUERY' : {
            return Object.assign({}, state, {neoQuery: action.neoQuery, isQuerying: true});
        }
        case 'SET_NEO_RESULTS' : {
            return Object.assign({}, state, {neoResults: action.neoResults});
        }
        default: {
            return state;
        }
    }
}

/*
var initialResState = {
    tablesRes: null,
    resPage: 1,
    tablePage: 1
};
/*

/*
 * Manage state for displaying results.
*/
/*
var resReducer = function(action, state){
    if(state === undefined) {
        return initialResState;
    }

    switch(action.type) {
        case 'SET_TABLE_RES': {
            return Object.assign({}, state, {tableRes: action.tableRes});
        }
        case 'SET_RES_PAGE' : {
            return Object.assign({}, state, {resPage: action.resPage});
        }
        case 'SET_TABLE_PAGE' : {
            return Object.assign({}, state, {tablePage: action.tablePage});
        }
        default: {
            return state;
        }
    }


}
*/
// TODO fix crash due to combiner
/*
var AppReducers = Redux.combineReducers({
    queryReducer: queryReducer,
    resReducer: resReducer
});
*/

//export default
export default queryReducer;
