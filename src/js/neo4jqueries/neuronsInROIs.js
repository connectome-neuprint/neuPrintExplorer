/*
 * Supports simple, custom neo4j query.
*/

"use strict"

import ClickableQuery from '../components/ClickableQuery.react';
import SimpleCellWrapper from '../helpers/SimpleCellWrapper';
var neo4j = require('neo4j-driver').v1;
import React from 'react';

const mainQuery = 'MATCH (neuron :`YY-Neuron`ZZ) XX WITH neuron AS neuron, apoc.convert.fromJsonMap(neuron.synapseCountPerRoi) AS roiInfo RETURN neuron.bodyId AS bodyid, neuron.name AS bodyname, neuron.synapseCountPerRoi AS roiInfo, neuron.size AS size, neuron.pre AS npre, neuron.post AS npost ORDER BY neuron.bodyId';

const preQuery = 'MATCH (m:`YY-Neuron`)-[e:ConnectsTo]->(n) WHERE m.bodyId=ZZ RETURN n.name AS Neuron, n.bodyId AS NeuronId, e.weight AS Weight ORDER BY e.weight DESC';
const postQuery = 'MATCH (m:`YY-Neuron`)<-[e:ConnectsTo]-(n) WHERE m.bodyId=ZZ RETURN n.name AS Neuron, n.bodyId AS NeuronId, e.weight AS Weight ORDER BY e.weight DESC';

const skeletonQuery = "MATCH (:`YY-Neuron` {bodyId:ZZ})-[:Contains]->(:Skeleton)-[:Contains]->(root :SkelNode) WHERE NOT (root)<-[:LinksTo]-() RETURN root.rowNumber AS rowId, root.location.x AS x, root.location.y AS y, root.location.z AS z, root.radius AS radius, -1 AS link ORDER BY root.rowNumber UNION match (:`YY-Neuron` {bodyId:ZZ})-[:Contains]->(:Skeleton)-[:Contains]->(s :SkelNode)<-[:LinksTo]-(ss :SkelNode) RETURN s.rowNumber AS rowId, s.location.x AS x, s.location.y AS y, s.location.z AS z, s.radius AS radius, ss.rowNumber AS link ORDER BY s.rowNumber"

function convert64bit(value) {
    return neo4j.isInt(value) ?
        (neo4j.integer.inSafeRange(value) ? 
            value.toNumber() : value.toString()) 
        : value;
}

function compareNeuronRows(row1, row2) {
    var total = 0;
    var total2 = 0;
    for (let i = 4; i < (row1.length-1); i++) {
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
    let colorid = parseInt(state.sourceId); // % 8;
        
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
        name: state.sourceId.toString(),
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
        inputneuronROIs[bodyid] = {};
        outputneuronROIs[bodyid] = {};
        neuronnames[bodyid] = {};
        neuronnames[bodyid]["name"] = record.get("bodyname");
        neuronnames[bodyid]["size"] = convert64bit(record.get("size"));
        neuronnames[bodyid]["pre"] = convert64bit(record.get("npre"));
        neuronnames[bodyid]["post"] = convert64bit(record.get("npost"));
        var rois = JSON.parse(record.get("roiInfo"));
        for (let item in rois) {
            if (state.inputROIs.indexOf(item) !== -1) {
                let insize = rois[item].post;
                if (insize > 0) {
                    inputneuronROIs[bodyid][item] = insize; 
                }
            }
            if (state.outputROIs.indexOf(item) !== -1) {
                let outsize = rois[item].pre;
                if (outsize > 0) {
                    outputneuronROIs[bodyid][item] = outsize; 
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

    headerdata.push(new SimpleCellWrapper(index++, "#voxels"))

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
                         neuronnames[bodyid].name));
                    
        
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
        frowinfo.push(new SimpleCellWrapper(index++,
                         neuronnames[bodyid].size));
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


