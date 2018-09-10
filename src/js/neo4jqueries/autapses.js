/*
 * Implements ROI connectivity query and table parser.
*/

"use strict";

import SimpleCellWrapper from '../helpers/SimpleCellWrapper';

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
        let bodyid = record.get("id");
        let weight = record.get("weight");
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

const mainQuery = 'MATCH (n:`ZZ-Neuron`)-[x:ConnectsTo]->(n)  WHERE n.pre > 1 RETURN n.bodyId AS id, x.weight AS weight, n.name AS name ORDER BY x.weight DESC'

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
