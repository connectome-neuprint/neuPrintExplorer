/*
 * Implements ROI connectivity query and table parser.
*/

"use strict";

import SimpleCellWrapper from '../helpers/SimpleCellWrapper';
import ClickableQuery from '../components/ClickableQuery.react';
import React from 'react';

var processProp = function(results, state) {
    // state: property
  
    let tables = [];
    let index = 0;
    let headerdata = [
        new SimpleCellWrapper(index++, "Property Value"),
    ];
    
    let data = [];
    let table = {
        header: headerdata,
        body: data,
        name: "Distinct values for property type: " + state.property, 
        sortIndices: new Set([0]),
    }

    results.records.forEach(function (record) {
        let val = record.get("val");
        data.push([
            new SimpleCellWrapper(index++, JSON.stringify(val))
        ]);
    });
    tables.push(table);
    return tables;
}

// create ROI tables
var processResults = function(results, state) {
    // state: datasetstr
  
    let tables = [];
    let index = 0;
    let headerdata = [
        new SimpleCellWrapper(index++, "Property Name"),
    ];
    
    let data = [];
    let table = {
        header: headerdata,
        body: data,
        name: "Distinct property types found in dataset", 
        sortIndices: new Set([0]),
    }

    results.records.forEach(function (record) {
        let pname = record.get("pname");
        let neoProp = {
            queryStr: "/npexplorer/neuronmetavals",
            params: { dataset: state.datasetstr, "key_name": pname },
            callback: processProp,
            isChild: true,
            state: {property: pname},
        }

        data.push([
            new SimpleCellWrapper(index++, 
                (<ClickableQuery neoQueryObj={neoProp}>
                    {pname}
                </ClickableQuery>)) 
        ]);
    });
    tables.push(table);
    return tables;
}

// creates query object and sends to callback
export default function(datasetstr) {
    let query = {
        queryStr: "/npexplorer/neuronmeta",
        params: { dataset: datasetstr },
        callback: processResults, 
        state: {
            datasetstr: datasetstr,
        },
    }
    return query;
}
