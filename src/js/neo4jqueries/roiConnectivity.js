/*
 * Implements ROI connectivity query and table parser.
*/

"use strict";

import SimpleCellWrapper from '../helpers/SimpleCellWrapper';
var neo4j = require('neo4j-driver').v1;
import ROIConnCell from '../components/ROIConnCell.react';
import ClickableQuery from '../components/ClickableQuery.react';
import React from 'react';
import neuronsInROIs from './neuronsInROIs';


function convert64bit(value) {
    return neo4j.isInt(value) ?
        (neo4j.integer.inSafeRange(value) ? 
            value.toNumber() : value.toString()) 
        : value;
}

// default color for max connection
var WEIGHTCOLOR = "255,100,100,";


// TODO: add clickable links in the ROI table
// TODO: add pairwise distribution of inputs/outputs to roi table

// create ROI tables
var processResults = function(results, state) {
    let bodyin = {};
    let completerois = state.rois;

    // provides information for column and ROIs
    let allrois = new Set();

    // TODO: need a list of ROIs saved in the database or from selection

    // grab inputs for a body id
    results.records.forEach(function (record) {
        let bodyid = convert64bit(record.get("bodyid"));
        let numpost = record.get("post");
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

        // add numost to provide size distribution
        if (!isNaN(numpost) && (parseInt(numpost) > 0)) {
            numpost = parseInt(numpost);
            if (!(bodyid in bodyin)) {
                bodyin[bodyid] = [[currroi, numpost]];
            } else {
                bodyin[bodyid].push([currroi, numpost]);
            }
        }
    });

    let roiroires = {};
    let roiroicounts = {};
    let maxval = 1;

    // grab output and add table entry
    results.records.forEach(function (record) {
        let bodyid = convert64bit(record.get("bodyid"));
        let numpre = record.get("pre");
        let rois = record.get("rois");

        let currroi = ""; // default to no roi

        if (!isNaN(numpre) && (numpre > 0)) {
            // should only be one roi label (other label will be dataset)
            for (let i = 0; i < rois.length; i++) {
                if (allrois.has(rois[i])) {
                    currroi = rois[i];
                    break;
                }
            }

            // create roi2roi based on input distribution
            if (currroi !== "" && (bodyid in bodyin)) {
                let totalvalue = 0;
                for (let i = 0; i < bodyin[bodyid].length; i++) {
                    totalvalue += bodyin[bodyid][i][1];
                }
                for (let i = 0; i < bodyin[bodyid].length; i++) {
                    let roiin = bodyin[bodyid][i][0];
                    if ((roiin === "") || (totalvalue === 0)) {
                        continue;
                    }
                    let value = numpre * bodyin[bodyid][i][1] * 1.0 / totalvalue;
                    let connname = roiin + "=>" + currroi;
                    if (connname in roiroires) {
                        roiroires[connname] += value;
                        roiroicounts[connname] += 1;
                    } else {
                        roiroires[connname] = value;
                        roiroicounts[connname] = 1;
                    }
                    let currval = roiroires[connname];
                    if (currval > maxval) {
                        maxval = currval;
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
            let count = 0;
            let connname = roiname + "=>" + roiname2;
            if (connname in roiroires) {
                val = parseInt(roiroires[connname].toFixed());
                count = roiroicounts[connname];
            }

            let scalefactor = 0;
            if (val > 0) {
                scalefactor = Math.log(val)/Math.log(maxval);
            }
            let typecolor = "rgba(" + WEIGHTCOLOR + scalefactor.toString() +  ")";

            let query = neuronsInROIs([roiname], [roiname2], "", state.datasetstr, true);

            data2.push(new SimpleCellWrapper(index++, 
                (<ClickableQuery neoQueryObj={query}>
                    <ROIConnCell 
                        weight={val}
                        count={count}
                        color={typecolor}
                    />
                </ClickableQuery>
                ),
                false, count));
        }
        data.push(data2);
    }

    // return results
    let headerdata = [
        new SimpleCellWrapper(index++, "")
    ];

    
    for (let roiname of allrois) {
        headerdata.push(new SimpleCellWrapper(index++, roiname));
    }
        
    let tables = [];
    let table = {
        paginate: false,
        header: headerdata,
        body: data,
        name: "ROI Connectivity (column: inputs, row: outputs)"
    };
    tables.push(table);
    return tables;


}

// TODO: update query
//const mainQuery = 'match (neuron :NeuronZZ)<-[:PartOf]-(roi :Neuropart) where (neuron.size) > 10 return neuron.bodyId as bodyid, roi.pre as pre, roi.post as post, labels(roi) as rois';
//const mainQuery = 'match (neuron :NeuronZZ)<-[:PartOf]-(roi :NeuronPart) where (neuron.pre + neuron.post) > 10 return neuron.bodyId as bodyid, roi.pre as pre, roi.post as post, labels(roi) as rois';
//const mainQuery = 'match (neuron :NeuronZZ)<-[:PartOf]-(roi :NeuronPart) where neuron.status<>"Not Examined"  return neuron.bodyId as bodyid, roi.pre as pre, roi.post as post, labels(roi) as rois';
const mainQuery = 'match (neuron :Big:NeuronZZ)<-[:PartOf]-(roi :NeuronPart) return neuron.bodyId as bodyid, roi.pre as pre, roi.post as post, labels(roi) as rois';

// creates query object and sends to callback
export default function(datasetstr, rois) {
    let neoquery = mainQuery.replace(/ZZ/g, datasetstr);
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
