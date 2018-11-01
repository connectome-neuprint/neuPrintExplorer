/*
 * Implements ROI connectivity query and table parser.
*/

"";

import SimpleCellWrapper from '../helpers/SimpleCellWrapper';
// create ROI tables
var processResults = function(results, state) {
    // state: datasetstr, rois
    let tables = [];
    let index = 0;
    let headerdata = [
        new SimpleCellWrapper(index++, "ROI"),
        new SimpleCellWrapper(index++, "%presyn"),
        new SimpleCellWrapper(index++, "total presyn"),
        new SimpleCellWrapper(index++, "%postsyn"),
        new SimpleCellWrapper(index++, "total postsyn"),
    ];
    
    let data = [];
    let table = {
        header: headerdata,
        body: data,
        name: "Coverage percentage of filtered neurons in " + state.datasetstr, 
        sortIndices: new Set([0,1,2,3,4]),
    }
    
    let roiset = new Set(state.rois);
    results.records.forEach(function (record) {
        //let bodyid = parseInt(record.get("id"));
        let roiname = record.get("unlabelres");
        if (roiset.has(roiname)) {

            let roipre = parseInt(record.get("roipre"));
            let roipost = parseInt(record.get("roipost"));

            let totalpre = parseInt(record.get("totalpre"));
            let totalpost = parseInt(record.get("totalpost"));

            data.push([
                new SimpleCellWrapper(index++, roiname),
                new SimpleCellWrapper(index++, ((roipre/totalpre)*100)),
                new SimpleCellWrapper(index++, totalpre),
                new SimpleCellWrapper(index++, ((roipost/totalpost)*100)),
                new SimpleCellWrapper(index++, totalpost),
            ]);
        }
    });
    
    tables.push(table);
    return tables;
}

// creates query object and sends to callback
export default function(datasetstr, rois, limitBig, statusFilters) {
    let params = { dataset: datasetstr, statuses: statusFilters };
    if (limitBig) {
        params["pre_threshold"] = 2; 
    }

    let query = {
        queryStr: "/npexplorer/completeness",
        params: params,
        callback: processResults, 
        state: {
            datasetstr: datasetstr,
            rois: rois,
        },
    }
 


    return query;
}
