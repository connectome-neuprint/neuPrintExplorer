/*
 * Stores configuration and other basic information for neo4j datasets.
*/

"use strict";

var neo4jsettingsState = {
    neoDriver: null,
    neoServer: "",
    availableDatasets: [],
    availableROIs: {},
    user: "neo4j",
    password: "neo4j",
    lastmod: "",
    version: "",
}


export default function neo4jreducer(state = neo4jsettingsState, action) {
    switch(action.type) {
        case 'SET_NEO_DRIVER' : {
            return Object.assign({}, state, {neoDriver: action.neoDriver});
        }
        case 'SET_NEO_SERVER' : {
            return Object.assign({}, state, {neoServer: action.neoServer, availableDatasets: action.availableDatasets, availableROIs: action.availableROIs, user: action.user, password: action.password, lastmod: action.lastmod, version: action.version});
        }
        default: {
            return state;
        }
    }
}
