/*
 * Finds common input/outputs from a list of bodyIds and returns weight of connections for all 
*/

"";

import SimpleCellWrapper from '../helpers/SimpleCellWrapper';

var processResults = function (results, state) {

    let index = 0;
    let tables = [];
    const queryKey = state.typeValue;

    const groupBy = function (inputJson, key) {
        return inputJson.reduce(function (accumulator, currentValue) {
            //name of the common input/output
            const name = currentValue["name"]
            //first element of the keys array is X_weight where X is the body id of a queried neuron
            let weights = Object.keys(currentValue)[0];
            // in case order of keys changes check that this is true and if not find the correct key
            if (!weights.endsWith("weight")) {
                for (let i = 1; i < Object.keys(currentValue).length ; i++) {
                    if (Object.keys(currentValue)[i].endsWith("weight")) {
                        weights = Object.keys(currentValue)[i]
                        break
                    }
                }
            }
            (accumulator[currentValue[key]] = accumulator[currentValue[key]] || {})[weights] = currentValue[weights]
            accumulator[currentValue[key]]["name"] = name
            return accumulator;
        }, {});
    };
    let groupedByInputOrOutputId = groupBy(results.records.data[0][0], queryKey);

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
