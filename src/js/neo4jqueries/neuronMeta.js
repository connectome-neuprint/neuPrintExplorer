/*
 * Implements ROI connectivity query and table parser.
*/

"use strict";

import SimpleCellWrapper from '../helpers/SimpleCellWrapper';
import neo4j from "neo4j-driver/lib/browser/neo4j-web";
import ClickableQuery from '../components/ClickableQuery.react';
import React from 'react';

function convert64bit(value) {
    return neo4j.isInt(value) ?
        (neo4j.integer.inSafeRange(value) ? 
            value.toNumber() : value.toString()) 
        : value;
}

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
        let val = convert64bit(record.get("val"));
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

    const basepropQ = propQuery.replace(/ZZ/g, state.datasetstr);

    results.records.forEach(function (record) {
        let pname = record.get("pname");
        let propQ = basepropQ.replace(/YY/g, pname);
        let neoProp = {
            queryStr: propQ,
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

const mainQuery = 'MATCH (n :`ZZ-Neuron`) WHERE n.pre > 1 UNWIND KEYS(n) AS x RETURN DISTINCT x AS pname'
const propQuery = 'MATCH (n :`ZZ-Neuron`) WHERE n.pre > 1 RETURN DISTINCT n.YY AS val'

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
