/*
 * Implements ROI connectivity query and table parser.
*/

"use strict";

import SimpleCellWrapper from '../helpers/SimpleCellWrapper';
var neo4j = require('neo4j-driver').v1;

function convert64bit(value) {
    return neo4j.isInt(value) ?
        (neo4j.integer.inSafeRange(value) ? 
            value.toNumber() : value.toString()) 
        : value;
}

// create ROI tables
var processResults = function(results) {
    // state: datasetstr
  
    let tables = [];
    let index = 0;
    let headerdata = [
        new SimpleCellWrapper(index++, "id"),
        new SimpleCellWrapper(index++, "name"),
        new SimpleCellWrapper(index++, "#connections"),
    ];
    
    let data = [];
    let table = {
        header: headerdata,
        body: data,
        name: "Number of autapses recorded for each neuron", 
        sortIndices: new Set([1,2]),
    }

    results.records.forEach(function (record) {
        let bodyid = convert64bit(record.get("id"));
        let weight = convert64bit(record.get("weight"));
        let name = record.get("name");
        data.push([
            new SimpleCellWrapper(index++, JSON.stringify(bodyid)),
            new SimpleCellWrapper(index++, name),
            new SimpleCellWrapper(index++, JSON.stringify(weight)),
        ]);
    });
    tables.push(table);
    return tables;
}

const mainQuery = 'MATCH (n:`ZZ-Neuron`)-[x:ConnectsTo]->(n)  WHERE n.pre > 1 OR n.post >= 10 RETURN n.bodyId AS id, x.weight AS weight, n.name AS name ORDER BY x.weight DESC'

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
