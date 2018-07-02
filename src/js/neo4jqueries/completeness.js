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
    }
    
    let roiset = new Set(state.rois);
    results.records.forEach(function (record) {
        //let bodyid = parseInt(convert64bit(record.get("id")));
        let roiname = record.get("unlabelres");
        if (roiset.has(roiname)) {

            let roipre = parseInt(convert64bit(record.get("roipre")));
            let roipost = parseInt(convert64bit(record.get("roipost")));

            let totalpre = parseInt(convert64bit(record.get("totalpre")));
            let totalpost = parseInt(convert64bit(record.get("totalpost")));

            data.push([
                new SimpleCellWrapper(index++, roiname),
                new SimpleCellWrapper(index++, ((roipre/totalpre)*100).toFixed(2)),
                new SimpleCellWrapper(index++, JSON.stringify(totalpre)),
                new SimpleCellWrapper(index++, ((roipost/totalpost)*100).toFixed(2)),
                new SimpleCellWrapper(index++, JSON.stringify(totalpost)),
            ]);
        }
    });
    
    tables.push(table);
    return tables;
}

const mainQuery = 'match (n:NeuronZZ)<-[:PartOf]-(part:NeuronPart) FF with labels(part) as labelnames, part as part unwind labelnames as unlabels with unlabels as unlabelres, sum(part.pre) as roipre, sum(part.post) as roipost match (meta:Meta) return unlabelres, roipre, roipost, meta[unlabelres + "PreCount"] as totalpre, meta[unlabelres + "PostCount"] as totalpost order by unlabelres'


// creates query object and sends to callback
export default function(datasetstr, rois, limitBig, statusFilters) {
    let neoquery = mainQuery.replace(/ZZ/g, datasetstr);

    if (limitBig === "true") {
        neoquery = neoquery.replace(/:Neuron:/g, ":Neuron:Big:");
    }
    if (statusFilters.length > 0) {
        let FF = "where (";

        for (let i = 0; i < statusFilters.length; i++) {
            if (i > 0) {
                FF = FF + " or ";
            }
            FF = FF + 'n.status = "' + statusFilters[i] + '"';
        }
        FF = FF + ")";

        neoquery = neoquery.replace("FF", FF);
    } else {
        neoquery = neoquery.replace("FF", "");
    }

    let query = {
        queryStr: neoquery,
        callback: processResults, 
        state: {
            datasetstr: datasetstr,
            rois: rois,
        },
    }
    return query;
}
