/*
 * Stores configuration and other basic information for neo4j datasets.
*/

"use strict";

var neo4jsettingsState = {
    neoDriver: null,
    neoServer: "",
    availableDatasets: [],
    availableROIs: [],
}


export default function neo4jreducer(state = neo4jsettingsState, action) {
    switch(action.type) {
        case 'SET_NEO_DRIVER' : {
            return Object.assign({}, state, {neoDriver: action.neoDriver});
        }
        case 'SET_NEO_SERVER' : {
            return Object.assign({}, state, {neoServer: action.neoServer, availableDatasets: action.availableDatasets, availableROIs: action.availableROIs});
        }
        default: {
            return state;
        }
    }
}
