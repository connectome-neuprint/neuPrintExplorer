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

const mainQuery = 'match (n:NeuronZZYY)<-[:PartOf]-(m:NeuronPartYY) XX with collect({body: n, part: m}) as bodyinfoarr, sum(m.FF) as tot unwind bodyinfoarr as bodyinfo return bodyinfo.body.bodyId as id, bodyinfo.part.FF as size, tot as total order by bodyinfo.part.FF desc'

//match (n:Neuron:Big:fib25)<-[:PartOf]-(m:NeuronPart:distal) where m.pre > 0 with collect({body: n, part: m}) as bodyinfo, sum(m.pre) as tot unwind bodyinfo as bodyinfo return bodyinfo.body.bodyId as id, bodyinfo.part.pre as size, tot as total order by bodyinfo.part.pre desc

//const mainQuery = 'match (n:NeuronZZYY) XX with collect(n) as bodies, sum(n.FF) as tot unwind bodies as body return body.bodyId as id, body.FF as size, tot as total order by body.FF desc'

// creates query object and sends to callback
export default function(datasetstr, roi, typename) {
    let neoquery = mainQuery.replace(/ZZ/g, datasetstr);
    neoquery = neoquery.replace(/YY/g, (":`" + roi + "`"));

    let XX = "where m.pre > 0";
    let FF = "pre";
    if (typename === "postsyn") {
        XX = "where m.post > 0";
        FF = "post";
    }
    neoquery = neoquery.replace(/XX/g, XX);
    neoquery = neoquery.replace(/FF/g, FF);

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
