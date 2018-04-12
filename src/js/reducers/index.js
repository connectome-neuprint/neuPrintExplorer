"use strict"; 

var initialQueryState = {
    pluginList: [],
    neoQuery: "",
    isQuerying: false,
    neoDriver: null,
    neoServer: "",
    neoError: null,
    neoResults: null,
    allTables: null,
    userInfo: null,
    availableDatasets: [],
    availableROIs: [],
    urlQueryString: window.location.search.substring(1),
    enableUrlQs: false,
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
        case 'UPDATE_QUERY' : {
            return Object.assign({}, state, {neoQuery: action.neoQuery, isQuerying: true});
        }
        case 'SET_QUERY_STATUS' : {
            return Object.assign({}, state, {isQuerying: action.isQuerying});
        }
        case 'SET_NEO_DRIVER' : {
            return Object.assign({}, state, {neoDriver: action.neoDriver});
        }
        case 'SET_NEO_SERVER' : {
            return Object.assign({}, state, {neoServer: action.neoServer, neoResults: null, neoError: null, isQuerying: false, availableDatasets: action.availableDatasets, availableROIs: action.availableROIs});
        }
        case 'SET_NEO_ERROR' : {
            return Object.assign({}, state, {neoError: action.neoError, isQuerying: false, neoResults: null});
        }
        case 'SET_NEO_RESULTS' : {
            return Object.assign({}, state, {neoResults: action.neoResults, isQuerying: false, neoError: null});
        }
        case 'UPDATE_RESULTS' : {
            return Object.assign({}, state, {allTables: action.allTables});
        }
        case 'LOGIN_USER' : {
            return Object.assign({}, state, {userInfo: action.userInfo});
        }
        case 'LOGOUT_USER' : {
            return Object.assign({}, state, {userInfo: null});
        }
        case 'SET_URL_QS' : {
            return Object.assign({}, state, {urlQueryString: action.urlQueryString});
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
