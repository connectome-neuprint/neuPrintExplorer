/*
 * Finds common input/outputs from a list of bodyIds and returns weight of connections for all 
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
var processResults = function(results, state) {

    let index = 0;
    let tables = [];
    const queryKey = state.typeValue;

    const groupBy = function(inputJson, key) {
        return inputJson.reduce(function(accumulator, currentValue) {
            let name = currentValue["name"];
            let weights = Object.keys(currentValue).slice(2);
            (accumulator[currentValue[key]] = accumulator[currentValue[key]] || {})[weights] = currentValue[weights];
            accumulator[currentValue[key]]["name"]=name;
            return accumulator;
        }, {});
    };
    let groupedByOutputId = groupBy(results.records[0].get("map"), queryKey);
    
    let headerdata = [
        new SimpleCellWrapper(index++, queryKey[0].toUpperCase() + queryKey.substring(1) + " BodyId"),
        new SimpleCellWrapper(index++, queryKey[0].toUpperCase() + queryKey.substring(1) + " Name"),
    ];
    const bodyIds = state.bodyIds.split(",");
    const bodyIdWeightHeadings = bodyIds.map(bodyId => bodyId + "_weight");
    bodyIdWeightHeadings.forEach( function(bodyIdWeightHeading) {
        headerdata.push(new SimpleCellWrapper(index++, bodyIdWeightHeading));
    });
    
    let data = [];
    const sortableIndicesArray = Array.from({length: bodyIdWeightHeadings.length+2}, (_, i) => i + 1);
    let table = {
        header: headerdata,
        body: data,
        name: "Common " + queryKey + "s for " + state.bodyIds + " in " + state.datasetstr, 
        sortIndices: new Set(sortableIndicesArray),
    }
    
    Object.keys(groupedByOutputId).forEach(function(output) {
        let singleRow = [
            new SimpleCellWrapper(index++, parseInt(convert64bit(output))),
            new SimpleCellWrapper(index++, groupedByOutputId[output]["name"]),
        ];
        bodyIdWeightHeadings.forEach( function(bodyIdWeightHeading) {
            const bodyIdWeightValue = groupedByOutputId[output][bodyIdWeightHeading] || 0;
            singleRow.push(new SimpleCellWrapper(index++, parseInt(convert64bit(bodyIdWeightValue))));
        });
        data.push(singleRow);
    });
    
    tables.push(table);
    return tables;
}

const mainQueryOutput = 'WITH [XX] AS bodyIds MATCH (k:`ZZ-Neuron`)-[r:ConnectsTo]->(c) WHERE (k.bodyId IN bodyIds FF) WITH k, c, r, toString(k.bodyId)+"_weight" AS dynamicWeight RETURN collect(apoc.map.fromValues(["output", c.bodyId, "name", c.name, dynamicWeight, r.weight])) AS map';
const mainQueryInput =  'WITH [XX] AS bodyIds MATCH (k:`ZZ-Neuron`)<-[r:ConnectsTo]-(c) WHERE (k.bodyId IN bodyIds FF) WITH k, c, r, toString(k.bodyId)+"_weight" AS dynamicWeight RETURN collect(apoc.map.fromValues(["input", c.bodyId, "name", c.name, dynamicWeight, r.weight])) AS map';

// TODO: find outputs or inputs based on user preference
export default function(datasetstr, bodyIds, limitBig, statusFilters, typeValue) {
    const mainQuery = typeValue=="output" ? mainQueryOutput : mainQueryInput;
    let neoquery = mainQuery.replace(/ZZ/g, datasetstr.replace(":",""));
    neoquery = neoquery.replace(/XX/g, bodyIds);
    let FF = "";
    if (limitBig === "true") {
        FF = "AND ((c.pre > 1) OR (c.post >= 10))";
    }
    if (statusFilters.length > 0) {
        if (FF === "") {
            FF = "AND (" ;
        } else {
            FF = FF + " AND (";
        }
        for (let i = 0; i < statusFilters.length; i++) {
            if (i > 0) {
                FF = FF + " OR ";
            }
            FF = FF + 'c.status = "' + statusFilters[i] + '"';
        }
        FF = FF + ")";
    }
    neoquery = neoquery.replace("FF", FF);

    let query = {
        queryStr: neoquery,
        callback: processResults, 
        state: {
            datasetstr: datasetstr,
            bodyIds: bodyIds,
            typeValue: typeValue,
        },
    }
    return query;
}
