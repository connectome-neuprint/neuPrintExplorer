/*
 * Supports simple, custom neo4j query.
*/

import ClickableQuery from '../components/ClickableQuery.react';
import SimpleCellWrapper from '../helpers/SimpleCellWrapper';
import React from 'react';
import RoiHeatMap, { ColorLegend } from '../components/visualization/MiniRoiHeatMap.react'
import RoiBarGraph from '../components/visualization/MiniRoiBarGraph.react'

const skeletonQuery =
  'MATCH (:`YY-Neuron` {bodyId:ZZ})-[:Contains]->(:Skeleton)-[:Contains]->(root :SkelNode) WHERE NOT (root)<-[:LinksTo]-() RETURN root.rowNumber AS rowId, root.location.x AS x, root.location.y AS y, root.location.z AS z, root.radius AS radius, -1 AS link ORDER BY root.rowNumber UNION match (:`YY-Neuron` {bodyId:ZZ})-[:Contains]->(:Skeleton)-[:Contains]->(s :SkelNode)<-[:LinksTo]-(ss :SkelNode) RETURN s.rowNumber AS rowId, s.location.x AS x, s.location.y AS y, s.location.z AS z, s.radius AS radius, ss.rowNumber AS link ORDER BY s.rowNumber';

function compareNeuronRows(row1, row2) {
  var total = 0;
  var total2 = 0;
  for (let i = 4; i < row1.length - 1; i++) {
    total += row1[i].getValue();
    total2 += row2[i].getValue();
  }

  return total2 - total;
}

var processSkeleton = function (results, state) {
  // state: sourceId, sourceName, isPre
  let tables = [];

  // parse swc
  let data = {};
  let colorid = parseInt(state.sourceId); // % 8;

  results.records.forEach(function (record) {
    let rowId = parseInt(record.get('rowId'));
    data[rowId] = {
      type: colorid,
      x: parseInt(record.get('x')),
      y: parseInt(record.get('y')),
      z: parseInt(record.get('z')),
      parent: parseInt(record.get('link')),
      radius: record.get('radius')
    };
  });

  let table = {
    isSkeleton: true,
    swc: data,
    name: state.sourceId.toString()
  };
  tables.push(table);
  return tables;
};

var processConnections = function (results, state) {
  // state: sourceId, sourceName, isPre

  let tables = [];
  let index = 0;
  let headerdata = [
    new SimpleCellWrapper(index++, 'Neuron ID'),
    new SimpleCellWrapper(index++, 'Neuron'),
    new SimpleCellWrapper(index++, '#connections')
  ];

  let sortIndices = new Set([1, 2]);
  let data = [];
  let table = {
    header: headerdata,
    body: data,
    name:
      'Connections ' +
      (state.isPre ? 'from ' : 'to ') +
      state.sourceName +
      ':bodyID=' +
      String(state.sourceId),
    sortIndices: sortIndices
  };
  results.records.forEach(function (record) {
    let bodyid = parseInt(record.get('Neuron2Id'));
    let bodyname = record.get('Neuron2');
    let weight = parseInt(record.get('Weight'));
    data.push([
      new SimpleCellWrapper(index++, bodyid),
      new SimpleCellWrapper(index++, bodyname),
      new SimpleCellWrapper(index++, weight)
    ]);
  });
  tables.push(table);
  return tables;
};

export var parseResults = function (neoResults, state) {
  var inputneuronROIs = {};
  var outputneuronROIs = {};
  var neuronnames = {};

  neoResults.records.forEach(function (record) {
    var bodyid = record.get('bodyid');
    inputneuronROIs[bodyid] = {};
    outputneuronROIs[bodyid] = {};
    neuronnames[bodyid] = {};
    neuronnames[bodyid]['name'] = record.get('bodyname');
    neuronnames[bodyid]['size'] = record.get('size');
    neuronnames[bodyid]['pre'] = record.get('npre');
    neuronnames[bodyid]['post'] = record.get('npost');
    neuronnames[bodyid]['status'] = record.get('neuronStatus');
    neuronnames[bodyid]['roiInfo'] = record.get('roiInfo');
    neuronnames[bodyid]['roiInfoObject'] = JSON.parse(neuronnames[bodyid]['roiInfo']);
    neuronnames[bodyid]['rois'] = record.get('rois');

    for (let item in neuronnames[bodyid].roiInfoObject) {
      if (state.inputROIs.indexOf(item) !== -1) {
        let insize = neuronnames[bodyid].roiInfoObject[item].post;
        if (insize > 0) {
          inputneuronROIs[bodyid][item] = insize;
        }
      }
      if (state.outputROIs.indexOf(item) !== -1) {
        let outsize = neuronnames[bodyid].roiInfoObject[item].pre;
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
    new SimpleCellWrapper(index++, 'id'),
    new SimpleCellWrapper(index++, 'neuron'),
    new SimpleCellWrapper(index++, 'status'),
    new SimpleCellWrapper(index++, '#post (inputs)'),
    new SimpleCellWrapper(index++, '#pre (outputs)')
  ];

  var titlename =
    'Neurons ' +
    state.neuronSrc +
    ' with inputs in: ' +
    JSON.stringify(state.inputROIs) +
    ' and outputs in: ' +
    JSON.stringify(state.outputROIs);

  for (let item in state.inputROIs) {
    headerdata.push(new SimpleCellWrapper(index++, 'In:' + state.inputROIs[item]));
  }
  for (let item in state.outputROIs) {
    headerdata.push(new SimpleCellWrapper(index++, 'Out:' + state.outputROIs[item]));
  }

  headerdata.push(new SimpleCellWrapper(index++, '#voxels'));

  headerdata.push(new SimpleCellWrapper(index++, <div>{"roi heatmap (mouseover for details)"} <ColorLegend /> </div>))
  headerdata.push(new SimpleCellWrapper(index++, "roi breakdown (mouseover for details)"))

  // load table body
  var formatinfo = [];
  const skeletonQ = skeletonQuery.replace(/YY/g, state.datasetstr);

  for (let bodyid in neuronnames) {

    let preTotal = 0
    let postTotal = 0
    const roiList = neuronnames[bodyid]['rois']

    Object.keys(neuronnames[bodyid].roiInfoObject).map((roi) => {
      if (roiList.find((element) => { return element === roi })) {
        preTotal += neuronnames[bodyid].roiInfoObject[roi]["pre"]
        postTotal += neuronnames[bodyid].roiInfoObject[roi]["post"]
      }
    })

    if (Object.keys(inputneuronROIs[bodyid]).length !== state.inputROIs.length) {
      continue;
    }
    if (Object.keys(outputneuronROIs[bodyid]).length !== state.outputROIs.length) {
      continue;
    }
    let preq = { dataset: state.datasetstr, neuron_id: parseInt(bodyid), find_inputs: false };
    let postq = { dataset: state.datasetstr, neuron_id: parseInt(bodyid), find_inputs: true };
    let skelq = skeletonQ.replace(/ZZ/g, bodyid);
    let statepre = {
      sourceId: bodyid,
      sourceName: neuronnames[bodyid].name,
      isPre: true
    };
    let statepost = {
      sourceId: bodyid,
      sourceName: neuronnames[bodyid].name,
      isPre: false
    };
    let neoPre = {
      queryStr: '/npexplorer/simpleconnections',
      params: preq,
      callback: processConnections,
      isChild: true,
      state: statepre
    };
    let neoPost = {
      queryStr: '/npexplorer/simpleconnections',
      params: postq,
      callback: processConnections,
      isChild: true,
      state: statepost
    };
    let neoSkel = {
      queryStr: skelq,
      callback: processSkeleton,
      isChild: true,
      state: statepost
    };

    let frowinfo = [];

    frowinfo.push(
      new SimpleCellWrapper(
        index++,
        <ClickableQuery neoQueryObj={neoSkel}>{parseInt(bodyid)}</ClickableQuery>,
        false,
        parseInt(bodyid),
      ),
    );

    frowinfo.push(new SimpleCellWrapper(index++, neuronnames[bodyid].name));

    frowinfo.push(new SimpleCellWrapper(index++, neuronnames[bodyid].status));

    frowinfo.push(
      new SimpleCellWrapper(
        index++,
        <ClickableQuery neoQueryObj={neoPost}>{JSON.stringify(neuronnames[bodyid].post)}</ClickableQuery>,
        false,
        parseInt(neuronnames[bodyid].post),
      ),
    );

    frowinfo.push(
      new SimpleCellWrapper(
        index++,
        (
          <ClickableQuery neoQueryObj={neoPre}>
            {JSON.stringify(neuronnames[bodyid].pre)}
          </ClickableQuery>
        ),
        false,
        parseInt(neuronnames[bodyid].pre)
      )
    );

    var presizes = inputneuronROIs[bodyid];
    var postsizes = outputneuronROIs[bodyid];

    for (let index2 = 0; index2 < state.inputROIs.length; index2++) {
      frowinfo.push(new SimpleCellWrapper(index++, parseInt(presizes[state.inputROIs[index2]])));
    }
    for (let index2 = 0; index2 < state.outputROIs.length; index2++) {
      frowinfo.push(new SimpleCellWrapper(index++, parseInt(postsizes[state.outputROIs[index2]])));
    }
    frowinfo.push(new SimpleCellWrapper(index++, neuronnames[bodyid].size));

    frowinfo.push(new SimpleCellWrapper(index++, <RoiHeatMap roiList={roiList} roiInfoObject={neuronnames[bodyid].roiInfoObject} preTotal={preTotal} postTotal={postTotal} />));
    frowinfo.push(new SimpleCellWrapper(index++, <RoiBarGraph roiList={roiList} roiInfoObject={neuronnames[bodyid].roiInfoObject} preTotal={preTotal} postTotal={postTotal} />));

    formatinfo.push(frowinfo);
  }

  formatinfo.sort(compareNeuronRows);

  let sortIndices = new Set([0, 1, 2, 3, 4, 5]);
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
};

export default function (inputROIs, outputROIs, neuronsrc, datasetstr, isChild) {
  let params = { dataset: datasetstr, input_ROIs: inputROIs, output_ROIs: outputROIs };
  if (neuronsrc !== '') {
    if (isNaN(neuronsrc)) {
      params['neuron_name'] = neuronsrc;
    } else {
      params['neuron_id'] = parseInt(neuronsrc);
    }
  }

  let query = {
    queryStr: '/npexplorer/findneurons',
    params: params,
    callback: parseResults,
    isChild: isChild,
    state: {
      neuronSrc: neuronsrc,
      outputROIs: outputROIs,
      inputROIs: inputROIs,
      datasetstr: datasetstr,
    },
  };

  return query;
}
