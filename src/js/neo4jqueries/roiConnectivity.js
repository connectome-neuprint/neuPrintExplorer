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


// TODO: add clickable links in the ROI table
// TODO: add pairwise distribution of inputs/outputs to roi table

// create ROI tables
var processResults = function(results, state) {
    let bodypre = {};
    let completerois = state.rois;

    // provides information for column and ROIs
    let allrois = new Set();

    // TODO: need a list of ROIs saved in the database or from selection

    // grab inputs for a body id
    results.records.forEach(function (record) {
        let bodyid = convert64bit(record.get("bodyid"));
        let numpre = record.get("pre");
        let rois = record.get("rois");
        let currroi = ""; // default to no roi

        // should only be one roi label (other label will be dataset)
        for (let i = 0; i < rois.length; i++) {
            if (completerois.includes(rois[i])) {
                allrois.add(rois[i]);
                currroi = rois[i];
                break;
            }
        }

        // add numpre to provide size distribution
        if (!isNaN(numpre) && (parseInt(numpre) > 0)) {
            numpre = parseInt(numpre);
            if (!(bodyid in bodypre)) {
                bodypre[bodyid] = [[currroi, numpre]];
            } else {
                bodypre[bodyid].push([currroi, numpre]);
            }
        }
    });

    let roiroires = {};

    // grab output and add table entry
    results.records.forEach(function (record) {
        let bodyid = convert64bit(record.get("bodyid"));
        let numpost = record.get("post");
        let rois = record.get("rois");

        let currroi = ""; // default to no roi

        if (!isNaN(numpost) && (numpost > 0)) {
            // should only be one roi label (other label will be dataset)
            for (let i = 0; i < rois.length; i++) {
                if (allrois.has(rois[i])) {
                    currroi = rois[i];
                    break;
                }
            }

            // create roi2roi based on input distribution
            if (currroi !== "" && (bodyid in bodypre)) {
                let totalvalue = 0;
                for (let i = 0; i < bodypre[bodyid].length; i++) {
                    totalvalue += bodypre[bodyid][i][1];
                }
                for (let i = 0; i < bodypre[bodyid].length; i++) {
                    let roipre = bodypre[bodyid][i][0];
                    if ((roipre === "") || (totalvalue === 0)) {
                        continue;
                    }
                    let value = numpost * bodypre[bodyid][i][1] * 1.0 / totalvalue;
                    let connname = roipre + "=>" + currroi;
                    if (connname in roiroires) {
                        roiroires[connname] += value;
                    } else {
                        roiroires[connname] = value;
                    }
                }
            }
        }
    });

    // make data table 
    let index = 0;
    let data = [];

    for (let roiname of allrois) {
        let data2 = [];
        data2.push(new SimpleCellWrapper(index++, roiname));
        for (let roiname2 of allrois) {
            let val = 0;
            let connname = roiname + "=>" + roiname2;
            if (connname in roiroires) {
                val = roiroires[connname].toFixed();
            }

            data2.push(new SimpleCellWrapper(index++, val));
        }
        data.push(data2);
    }

    // return results
    let headerdata = [
        new SimpleCellWrapper(index++, ""),
    ];

    for (let roiname of allrois) {
        headerdata.push(new SimpleCellWrapper(index++, roiname));
    }
        
    let tables = [];
    let table = {
        header: headerdata,
        body: data,
        name: "ROI Connectivity"
    };
    tables.push(table);
    return tables;


}

// TODO: update query
const mainQuery = 'match (neuron :NeuronZZ)<-[:PartOf]-(roi :Neuropart) where (neuron.size) > 10 return neuron.bodyId as bodyid, roi.pre as pre, roi.post as post, labels(roi) as rois';
//const mainQuery = 'match (neuron :NeuronZZ)<-[:PartOf]-(roi :Neuropart) where (neuron.pre + neuron.post) > 10 return neuron.bodyId as bodyid, roi.pre as pre, roi.post as post, labels(roi) as rois';

// creates query object and sends to callback
export default function(callback, datasetstr, rois) {
    let neoquery = mainQuery.replace(/ZZ/g, datasetstr);
    let query = {
        queryStr: neoquery,
        callback: processResults, 
        state: {
            datasetstr: datasetstr,
            rois: rois,
        },
    }
    callback(query);
}
