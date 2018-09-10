/*
 * Implements ROI connectivity query and table parser.
*/

"use strict";

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

const mainQuery = "MATCH (n:`ZZ-Neuron`) FF WITH apoc.convert.fromJsonMap(n.synapseCountPerRoi) AS roiInfo WITH roiInfo AS roiInfo, keys(roiInfo) AS roiList UNWIND roiList AS roiName WITH roiName AS roiName, sum(roiInfo[roiName].pre) AS pre, sum(roiInfo[roiName].post) AS post MATCH (meta:Meta:ZZ) WITH apoc.convert.fromJsonMap(meta.synapseCountPerRoi) AS globInfo, roiName AS roiName, pre AS pre, post AS post RETURN roiName AS unlabelres, pre AS roipre, post AS roipost, globInfo[roiName].pre AS totalpre, globInfo[roiName].post AS totalpost ORDER BY roiName"


// creates query object and sends to callback
export default function(datasetstr, rois, limitBig, statusFilters) {
    let neoquery = mainQuery.replace(/ZZ/g, datasetstr);

    let FF = ""
    if (limitBig === "true") {
        FF = "WHERE ((n.pre > 1))"
    
    }
    if (statusFilters.length > 0) {
        if (FF === "") {
            FF = "WHERE (" 
            
        } else {
            FF = FF + " AND (";
        }
        for (let i = 0; i < statusFilters.length; i++) {
            if (i > 0) {
                FF = FF + " or ";
            }
            FF = FF + 'n.status = "' + statusFilters[i] + '"';
        }
        FF = FF + ")";
    }
    neoquery = neoquery.replace("FF", FF);

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
