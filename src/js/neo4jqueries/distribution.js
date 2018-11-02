/*
 * Implements ROI connectivity query and table parser.
*/

"";

import SimpleCellWrapper from '../helpers/SimpleCellWrapper';

// create ROI tables
var processResults = function(results, state) {
    // state: datasetstr, typename, roi

    let typeheader = "Number of pre-synapses";
    if (state.typename === "postsyn") {
        typeheader = "Number of post-synapses";
    }

    let tables = [];
    let index = 0;
    let headerdata = [
        new SimpleCellWrapper(index++, "percentage"),
        new SimpleCellWrapper(index++, "num segments"),
        new SimpleCellWrapper(index++, typeheader),
    ];
    
    let data = [];
    let table = {
        header: headerdata,
        body: data,
        name: "Distribution of body sizes for " + state.roi, 
    }

    let dist = [.2, .3, .4, .5, .6, .7, .8, .9, .95, 1.0];
    let currdist = 0;

    let distCount = [];
    let distTotal = [];
    let currSize = 0;
    let numSeg = 0;

    results.records.forEach(function (record) {
        //let bodyid = parseInt(record.get("id"));
        let size = parseInt(record.get("size"));
        let total = parseInt(record.get("total"));
        currSize += size;
        numSeg++;

        while ((currdist < dist.length) && ((currSize)/total >= dist[currdist])) {
            distCount.push(numSeg);
            distTotal.push(currSize);

            data.push([
                new SimpleCellWrapper(index++, JSON.stringify(dist[currdist])),
                new SimpleCellWrapper(index++, JSON.stringify(distCount[currdist])),
                new SimpleCellWrapper(index++, JSON.stringify(distTotal[currdist])),
            ]);
            currdist++;
        }
    });
    
    tables.push(table);
    return tables;
}

// creates query object and sends to callback
export default function(datasetstr, roi, typename) {
    let params = { dataset: datasetstr, ROI: roi, "is_pre": typename !== "postsyn" };

    let query = {
        queryStr: "/npexplorer/distribution",
        params: params,
        callback: processResults, 
        state: {
            datasetstr: datasetstr,
            typename: typename,
            roi: roi,
        },
    }
    
    return query;
}
