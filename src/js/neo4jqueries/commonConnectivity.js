/*
 * Finds common input/outputs from a list of bodyIds and returns weight of connections for all 
*/

"use strict";

import SimpleCellWrapper from '../helpers/SimpleCellWrapper';

// create ROI tables
var processResults = function (results, state) {

    let index = 0;
    let tables = [];
    const queryKey = state.typeValue;

    const groupBy = function (inputJson, key) {
        return inputJson.reduce(function (accumulator, currentValue) {
            let name = currentValue["name"];
            let weights = Object.keys(currentValue).slice(2);
            (accumulator[currentValue[key]] = accumulator[currentValue[key]] || {})[weights] = currentValue[weights];
            accumulator[currentValue[key]]["name"] = name;
            return accumulator;
        }, {});
    };
    let groupedByInputOrOutputId = groupBy(results.records.pos(0).get("map"), queryKey);

    let headerdata = [
        new SimpleCellWrapper(index++, queryKey[0].toUpperCase() + queryKey.substring(1) + " BodyId"),
        new SimpleCellWrapper(index++, queryKey[0].toUpperCase() + queryKey.substring(1) + " Name"),
    ];

    let selectedNeurons = [];
    if (state.bodyIds.length > 0) {
        selectedNeurons = state.bodyIds.split(",");
    } else {
        selectedNeurons = state.names.split(",");
    }

    const selectedWeightHeadings = selectedNeurons.map(neuron => neuron + "_weight");
    selectedWeightHeadings.forEach(function (neuronWeightHeading) {
        headerdata.push(new SimpleCellWrapper(index++, neuronWeightHeading));
    });

    let data = [];
    const sortableIndicesArray = Array.from({ length: selectedWeightHeadings.length + 2 }, (_, i) => i + 1);
    let table = {
        header: headerdata,
        body: data,
        name: "Common " + queryKey + "s for " + selectedNeurons + " in " + state.datasetstr,
        sortIndices: new Set(sortableIndicesArray),
    }

    Object.keys(groupedByInputOrOutputId).forEach(function (inputOrOutput) {
        let singleRow = [
            new SimpleCellWrapper(index++, parseInt(inputOrOutput)),
            new SimpleCellWrapper(index++, groupedByInputOrOutputId[inputOrOutput]["name"]),
        ];
        selectedWeightHeadings.forEach(function (selectedWeightHeading) {
            const selectedWeightValue = groupedByInputOrOutputId[inputOrOutput][selectedWeightHeading] || 0;
            singleRow.push(new SimpleCellWrapper(index++, parseInt(selectedWeightValue)));
        });
        data.push(singleRow);
    });

    tables.push(table);
    return tables;
}

const mainQueryOutput = 'WITH [XX] AS inputs MATCH (k:`ZZ-Neuron`)-[r:ConnectsTo]->(c) WHERE (k.YY IN inputs FF) WITH k, c, r, toString(k.YY)+"_weight" AS dynamicWeight RETURN collect(apoc.map.fromValues(["output", c.bodyId, "name", c.name, dynamicWeight, r.weight])) AS map';
const mainQueryInput = 'WITH [XX] AS inputs MATCH (k:`ZZ-Neuron`)<-[r:ConnectsTo]-(c) WHERE (k.YY IN inputs FF) WITH k, c, r, toString(k.YY)+"_weight" AS dynamicWeight RETURN collect(apoc.map.fromValues(["input", c.bodyId, "name", c.name, dynamicWeight, r.weight])) AS map';

// TODO: find outputs or inputs based on user preference
export default function (datasetstr, bodyIds, names, limitBig, statusFilters, typeValue) {
    const mainQuery = typeValue == "output" ? mainQueryOutput : mainQueryInput;
    let neoQuery = mainQuery.replace(/ZZ/g, datasetstr.replace(":", ""));

    if (bodyIds.length > 0) {
        neoQuery = neoQuery.replace(/YY/g, "bodyId");
        neoQuery = neoQuery.replace(/XX/g, bodyIds);
    } else {
        neoQuery = neoQuery.replace(/YY/g, "name");
        neoQuery = neoQuery.replace(/XX/g, names.split(",").map(n => "\"" + n + "\""));
    }

    let FF = "";
    if (limitBig === "true") {
        FF = "AND ((c.pre > 1) OR (c.post >= 10))";
    }
    if (statusFilters.length > 0) {
        if (FF === "") {
            FF = "AND (";
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
    neoQuery = neoQuery.replace("FF", FF);

    let query = {
        queryStr: neoQuery,
        callback: processResults,
        state: {
            datasetstr: datasetstr,
            bodyIds: bodyIds,
            names: names,
            typeValue: typeValue,
        },
    }
    return query;
}
