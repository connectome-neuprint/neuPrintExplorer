/*
 * Implements ROI connectivity query and table parser.
*/

"use strict";

import SimpleCellWrapper from '../helpers/SimpleCellWrapper';
import neo4j from "neo4j-driver/lib/browser/neo4j-web";

function convert64bit(value) {
    return neo4j.isInt(value) ?
        (neo4j.integer.inSafeRange(value) ? 
            value.toNumber() : value.toString()) 
        : value;
}

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
        //let bodyid = parseInt(convert64bit(record.get("id")));
        let size = parseInt(convert64bit(record.get("size")));
        let total = parseInt(convert64bit(record.get("total")));
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

const mainQuery = 'MATCH (n:`ZZ-Neuron`YY) XX WITH n.bodyId as bodyId, apoc.convert.fromJsonMap(n.synapseCountPerRoi)[GG].FF AS FFsize WHERE FFsize > 0 WITH collect({id: bodyId, FF: FFsize}) as bodyinfoarr, sum(FFsize) AS tot UNWIND bodyinfoarr AS bodyinfo RETURN bodyinfo.id AS id, bodyinfo.FF AS size, tot AS total ORDER BY bodyinfo.FF DESC'

// creates query object and sends to callback
export default function(datasetstr, roi, typename) {
    let neoquery = mainQuery.replace(/ZZ/g, datasetstr);
    neoquery = neoquery.replace(/YY/g, (":`" + datasetstr + "-" + roi + "`"));

    let XX = "WHERE n.pre > 0";
    let FF = "pre";
    if (typename === "postsyn") {
        XX = "WHERE n.post > 0";
        FF = "post";
    }
    neoquery = neoquery.replace(/XX/g, XX);
    neoquery = neoquery.replace(/FF/g, FF);
    neoquery = neoquery.replace(/GG/g, '"' + roi + '"');

    let query = {
        queryStr: neoquery,
        callback: processResults, 
        state: {
            datasetstr: datasetstr,
            typename: typename,
            roi: roi,
        },
    }
    return query;
}
