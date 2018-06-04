/*
 * Supports simple, custom neo4j query.
*/

"use strict"

import ClickableQuery from '../components/ClickableQuery.react';
import SimpleCellWrapper from '../helpers/SimpleCellWrapper';
var neo4j = require('neo4j-driver').v1;
import React from 'react';

const mainQuery = 'match (neuron :NeuronZZYY)<-[:PartOf]-(roi :NeuronPart) XX return neuron.bodyId as bodyid, neuron.name as bodyname, roi.pre as pre, roi.post as post, labels(roi) as rois, neuron.size as size, neuron.pre as npre, neuron.post as npost order by neuron.bodyId';

const preQuery = 'match (m:NeuronYY)-[e:ConnectsTo]->(n:NeuronYY) where m.bodyId=ZZ return n.name as Neuron, n.bodyId as NeuronId, e.weight as Weight order by e.weight desc';
const postQuery = 'match (m:NeuronYY)<-[e:ConnectsTo]-(n:NeuronYY) where m.bodyId=ZZ return n.name as Neuron, n.bodyId as NeuronId, e.weight as Weight order by e.weight desc';

const skeletonQuery = "match (:NeuronYY {bodyId:ZZ})-[:Contains]->(:Skeleton)-[:Contains]->(root :SkelNode) where not (root)<-[:LinksTo]-() return root.rowNumber as rowId, root.x as x, root.y as y, root.z as z, root.radius as radius, -1 as link order by root.rowNumber UNION match (:NeuronYY {bodyId:ZZ})-[:Contains]->(:Skeleton)-[:Contains]->(s :SkelNode)<-[:LinksTo]-(ss :SkelNode) return s.rowNumber as rowId, s.x as x, s.y as y, s.z as z, s.radius as radius, ss.rowNumber as link order by s.rowNumber"

function convert64bit(value) {
    return neo4j.isInt(value) ?
        (neo4j.integer.inSafeRange(value) ? 
            value.toNumber() : value.toString()) 
        : value;
}

function compareNeuronRows(row1, row2) {
    var total = 0;
    var total2 = 0;
    for (let i = 5; i < row1.length; i++) {
        total += row1[i].getValue();
        total2 += row2[i].getValue();
    }

    return total2 - total;
}

var processSkeleton = function(results, state) {
    // state: sourceId, sourceName, isPre
    let tables = [];
    
    // parse swc 
    let data = {};
    let colorid = parseInt(state.sourceId) % 8;
        
    results.records.forEach(function (record) {
        let rowId = parseInt(convert64bit(record.get("rowId")));
        data[rowId] = {
            type: colorid,
            x: parseInt(convert64bit(record.get("x"))),
            y: parseInt(convert64bit(record.get("y"))),
            z: parseInt(convert64bit(record.get("z"))),
            parent: parseInt(convert64bit(record.get("link"))),
            radius: record.get("radius"),
        }
    });

    let table = {
        isSkeleton: true,
        swc: data,
        name: "Skeleton of " + state.sourceId.toString(),
    };
    tables.push(table);
    return tables;
}

var processConnections = function(results, state) {
    // state: sourceId, sourceName, isPre
  
    let tables = [];
    let index = 0;
    let headerdata = [
        new SimpleCellWrapper(index++, "Neuron ID"),
        new SimpleCellWrapper(index++, "Neuron"),
        new SimpleCellWrapper(index++, "#connections"),
    ];
    
    let sortIndices = new Set([1,2]);
    let data = [];
    let table = {
        header: headerdata,
        body: data,
        name: "Connections " + (state.isPre ? "from " : "to ") + state.sourceName + ":bodyID=" + String(state.sourceId), 
        sortIndices: sortIndices,
    }
    results.records.forEach(function (record) {
        let bodyid = parseInt(convert64bit(record.get("NeuronId")));
        let bodyname = record.get("Neuron");
        let weight = parseInt(convert64bit(record.get("Weight")));
        data.push([
            new SimpleCellWrapper(index++, bodyid),
            new SimpleCellWrapper(index++, bodyname),
            new SimpleCellWrapper(index++, weight),
        ]);
    });
    tables.push(table);
    return tables;
}

export var parseResults = function(neoResults, state) {
    var inputneuronROIs = {};
    var outputneuronROIs = {};
    var neuronnames = {}; 

    neoResults.records.forEach(function (record) {
        var bodyid = convert64bit(record.get("bodyid"));
        if (!(bodyid in inputneuronROIs)) {
            inputneuronROIs[bodyid] = {};
            outputneuronROIs[bodyid] = {};
            neuronnames[bodyid] = {};
            neuronnames[bodyid]["name"] = record.get("bodyname");
            neuronnames[bodyid]["size"] = convert64bit(record.get("size"));
            neuronnames[bodyid]["pre"] = convert64bit(record.get("npre"));
            neuronnames[bodyid]["post"] = convert64bit(record.get("npost"));
        }

        var rois = record.get("rois");
        for (let item in rois) {
            if (state.inputROIs.indexOf(rois[item]) !== -1) {
                var insize = convert64bit(record.get("post"));
                if (insize > 0) {
                    inputneuronROIs[bodyid][rois[item]] = insize; 
                }
            }
            if (state.outputROIs.indexOf(rois[item]) !== -1) {
                var outsize = convert64bit(record.get("pre"));
                if (outsize > 0) {
                    outputneuronROIs[bodyid][rois[item]] = outsize; 
                }
            }
        }
    });

    // create table
    var tables = [];
 
    let index = 0;
    let headerdata = [
        new SimpleCellWrapper(index++, "id"),
        new SimpleCellWrapper(index++, "neuron"),
        new SimpleCellWrapper(index++, "#voxels"),
        new SimpleCellWrapper(index++, "#post (inputs)"),
        new SimpleCellWrapper(index++, "#pre (outputs)"),
    ];

    var titlename = "Neurons " + state.neuronSrc + " with inputs in: " + JSON.stringify(state.inputROIs) + " and outputs in: " + JSON.stringify(state.outputROIs); 
    
    for (let item in state.inputROIs) {
        headerdata.push(new SimpleCellWrapper(index++,
                                             "In:" + state.inputROIs[item]));
    }
    for (let item in state.outputROIs) {
        headerdata.push(new SimpleCellWrapper(index++,
                                             "Out:" + state.outputROIs[item]));
    }

    // load table body
    var formatinfo = [];
    
    const basepreQ = preQuery.replace(/YY/g, state.datasetstr)
    const basepostQ = postQuery.replace(/YY/g, state.datasetstr)
    const skeletonQ = skeletonQuery.replace(/YY/g, state.datasetstr)

    for (let bodyid in neuronnames) {
        if (Object.keys(inputneuronROIs[bodyid]).length !== state.inputROIs.length) {
            continue;
        }
        if (Object.keys(outputneuronROIs[bodyid]).length !== state.outputROIs.length) {
            continue;
        }
        let preq = basepreQ.replace("ZZ", bodyid);
        let postq = basepostQ.replace("ZZ", bodyid);
        let skelq = skeletonQ.replace(/ZZ/g, bodyid);
        let statepre = {
            sourceId: bodyid,
            sourceName: neuronnames[bodyid].name,
            isPre: true,
        };
        let statepost = {
            sourceId: bodyid,
            sourceName: neuronnames[bodyid].name,
            isPre: false,
        };
        let neoPre = {
            queryStr: preq,
            callback: processConnections,
            isChild: true,
            state: statepre,
        };
        let neoPost = {
            queryStr: postq,
            callback: processConnections,
            isChild: true,
            state: statepost,
        };
        let neoSkel = {
            queryStr: skelq,
            callback: processSkeleton,
            isChild: true,
            state: statepost
        };

        let frowinfo = [];

        frowinfo.push(new SimpleCellWrapper(index++,
                         (<ClickableQuery neoQueryObj={neoSkel}>
                            {parseInt(bodyid)}
                        </ClickableQuery>),
                        false, parseInt(neuronnames[bodyid].pre)));
 

        frowinfo.push(new SimpleCellWrapper(index++,
                         JSON.stringify(neuronnames[bodyid].name)));
                    
        frowinfo.push(new SimpleCellWrapper(index++,
                         parseInt(neuronnames[bodyid].size)));
        
        frowinfo.push(new SimpleCellWrapper(index++,
                         (<ClickableQuery neoQueryObj={neoPost}>
                            {JSON.stringify(neuronnames[bodyid].post)}
                        </ClickableQuery>),
                        false, parseInt(neuronnames[bodyid].post)));
        
        frowinfo.push(new SimpleCellWrapper(index++,
                         (<ClickableQuery neoQueryObj={neoPre}>
                            {JSON.stringify(neuronnames[bodyid].pre)}
                        </ClickableQuery>),
                        false, parseInt(neuronnames[bodyid].pre)));
 
        var presizes = inputneuronROIs[bodyid];
        var postsizes = outputneuronROIs[bodyid];

        for (let index2 = 0; index2 < state.inputROIs.length; index2++) {
            frowinfo.push(new SimpleCellWrapper(index++,
                                parseInt(presizes[state.inputROIs[index2]])));
        }
        for (let index2 = 0; index2 < state.outputROIs.length; index2++) {
            frowinfo.push(new SimpleCellWrapper(index++,
                                parseInt(postsizes[state.outputROIs[index2]])));
        }
        formatinfo.push(frowinfo);
    }

    formatinfo.sort(compareNeuronRows);

    let sortIndices = new Set([1,2,3,4]);
    for (let i = 5; i < headerdata.length; i++) {
        sortIndices.add(i);
    }

    tables.push({
        header: headerdata,
        body: formatinfo,
        name: titlename,
        sortIndices: sortIndices,
    });

    return tables;
}

export default function(inputROIs, outputROIs, neuronsrc, datasetstr, isChild) { 
    // parse ROIs
    var roisstr = "";
    for (let item in inputROIs) {
        roisstr = roisstr + ":`" + inputROIs[item] + "`";
    }
    for (let item in outputROIs) {
        roisstr = roisstr + ":`" + outputROIs[item] + "`";
    }

    var neoquery = mainQuery.replace(/ZZ/g, roisstr);
    neoquery = neoquery.replace(/YY/g, datasetstr);

    // filter neuron information
    if (neuronsrc === "") {
        neoquery = neoquery.replace("XX", "");

    } else if (isNaN(neuronsrc)) {
        neoquery = neoquery.replace("XX", 'where neuron.name =~"' + neuronsrc + '"');
    } else {
        neoquery = neoquery.replace("XX", 'where neuron.bodyId =' + neuronsrc);
    }

    let query = {
        queryStr: neoquery,
        callback: parseResults,    
        isChild: isChild,
        state: {
            neuronSrc: neuronsrc,
            outputROIs: outputROIs,
            inputROIs: inputROIs,
            datasetstr: datasetstr, 
        },
    }
    
    return query;
}


