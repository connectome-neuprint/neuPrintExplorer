/*
 * Stores configuration and other basic information for neo4j datasets.
*/

"use strict";

import C from "./constants"

var neo4jsettingsState = {
    availableDatasets: [],
    availableROIs: {},
    datasetInfo: {},
    neoServer: "",
}


export default function neo4jreducer(state = neo4jsettingsState, action) {
    switch (action.type) {
        case C.SET_NEO_DATASETS: {
            return Object.assign({}, state, { availableDatasets: action.availableDatasets, availableROIs: action.availableROIs, datasetInfo: action.datasetInfo });
        }
        default: {
            return state;
        }
    }
}
