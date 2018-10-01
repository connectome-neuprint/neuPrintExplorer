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

// TODO: find outputs or inputs based on user preference
export default function (datasetstr, bodyIds, names, limitBig, statusFilters, typeValue) {
    let idlist = (bodyIds === "") ? []: bodyIds.split(",");
    for (let index in idlist) {
        idlist[index] = parseInt(idlist[index])
    }
    
    let params = { 
                    dataset: datasetstr,
                    statuses: statusFilters,
                    "neuron_names": (names === "") ? []: names.split(","), 
                    "neuron_ids": idlist, 
                    find_inputs: typeValue !== "output" 
    };
    if (limitBig === "true") {
        params["pre_threshold"] = 2; 
    }

    alert(JSON.stringify(params));
    let query = {
        queryStr: "/npexplorer/commonconnectivity",
        params: params,
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
