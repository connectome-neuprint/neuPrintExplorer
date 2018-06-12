/*
 * Implements ROI connectivity query and table parser.
*/

"use strict";

import SimpleCellWrapper from '../helpers/SimpleCellWrapper';
//var neo4j = require('neo4j-driver').v1;
//import ClickableQuery from '../components/ClickableQuery.react';
//import React from 'react';



// create ROI tables
var processResults = function(results) {
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
        name: "Unqiue property types found in dataset", 
        sortIndices: new Set([0]),
    }
    results.records.forEach(function (record) {
        let pname = record.get("pname");
        data.push([
            new SimpleCellWrapper(index++, pname),
        ]);
    });
    tables.push(table);
    return tables;
}

const mainQuery = 'match (n :Neuron:BigZZ) unwind keys(n) as x return distinct x as pname'

// creates query object and sends to callback
export default function(datasetstr) {
    let neoquery = mainQuery.replace(/ZZ/g, datasetstr);
    let query = {
        queryStr: neoquery,
        callback: processResults, 
        state: {
            datasetstr: datasetstr,
        },
    }
    return query;
}
