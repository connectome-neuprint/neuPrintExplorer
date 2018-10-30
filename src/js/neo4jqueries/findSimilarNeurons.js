/*
 * Find neurons similar to a provided neuron.
*/

import SimpleCellWrapper from '../helpers/SimpleCellWrapper';
import React from 'react';
import ClickableQuery from '../components/ClickableQuery.react';
import RoiHeatMap, { ColorLegend } from '../components/visualization/MiniRoiHeatMap.react';
import RoiBarGraph from '../components/visualization/MiniRoiBarGraph.react';

const processResults = function(results, state) {
  let index = 0;
  const tables = [];

  const headerdata = [
    new SimpleCellWrapper(index++, 'bodyId'),
    new SimpleCellWrapper(index++, 'name'),
    new SimpleCellWrapper(index++, 'status'),
    new SimpleCellWrapper(index++, '#pre'),
    new SimpleCellWrapper(index++, '#post'),
    new SimpleCellWrapper(
      index++,
      (
        <div>
          {'roi heatmap (mouseover for details)'} <ColorLegend />{' '}
        </div>
      )
    ),
    new SimpleCellWrapper(index++, 'roi breakdown (mouseover for details)')
  ];

  const data = [];
  let table;

  if (results.records.data.length > 0) {
    const clusterName = results.records.data[0][7];
    table = {
      header: headerdata,
      body: data,
      name: 'Neurons similar to ' + state.bodyId + ' with classification ' + clusterName,
      sortIndices: new Set([0, 1, 2, 3, 4])
    };

    results.records.forEach(function(record) {
      const bodyId = record.get('n.bodyId');
      const name = record.get('n.name');
      const status = record.get('n.status');
      const pre = record.get('n.pre');
      const post = record.get('n.post');
      const roiInfo = record.get('n.roiInfo');
      const roiList = record.get('rois');
      const connectionQuery =
        'MATCH (n:`' +
        state.dataset +
        '-Neuron`{clusterName:"' +
        clusterName +
        '"}) WITH n.bodyId AS bodyId, ' +
        'neuprint.getClusterNamesOfConnections(n.bodyId,"' +
        state.dataset +
        '") AS conInfo, ' +
        'n.pre AS pre, n.post AS post, n.name AS name, n.status AS status ' +
        'RETURN bodyId, pre, post, name, status, conInfo';

      const roiInfoObject = JSON.parse(roiInfo);
      let preRoiTotal = 0;
      let postRoiTotal = 0;
      Object.keys(roiInfoObject).forEach(roi => {
        if (
          roiList.find(element => {
            return element === roi;
          })
        ) {
          preRoiTotal += roiInfoObject[roi]['pre'];
          postRoiTotal += roiInfoObject[roi]['post'];
        }
      });
      let preTotal = pre;
      let postTotal = post;
      roiInfoObject['none'] = {};
      roiInfoObject['none']['pre'] = pre - preRoiTotal;
      roiInfoObject['none']['post'] = post - postRoiTotal;
      roiList.push('none');

      const neoConnectionClusters = {
        queryStr: connectionQuery,
        callback: processConnections,
        isChild: true,
        state: {
          clusterName: clusterName,
          dataset: state.dataset
        }
      };

      data.push([
        new SimpleCellWrapper(index++, parseInt(bodyId)),
        new SimpleCellWrapper(
          index++,
          <ClickableQuery neoQueryObj={neoConnectionClusters}>{parseInt(bodyId)}</ClickableQuery>
        ),
        new SimpleCellWrapper(index++, name),
        new SimpleCellWrapper(index++, status),
        new SimpleCellWrapper(index++, parseInt(pre)),
        new SimpleCellWrapper(index++, parseInt(post)),
        new SimpleCellWrapper(
          index++,
          (
            <RoiHeatMap
              roiList={roiList}
              roiInfoObject={roiInfoObject}
              preTotal={preTotal}
              postTotal={postTotal}
            />
          )
        ),
        new SimpleCellWrapper(
          index++,
          (
            <RoiBarGraph
              roiList={roiList}
              roiInfoObject={roiInfoObject}
              preTotal={preTotal}
              postTotal={postTotal}
            />
          )
        )
      ]);
    });
  } else {
    alert('Body ID not in dataset.');
    table = {
      header: headerdata,
      body: data,
      name: '',
      sortIndices: new Set([0, 1, 2, 3, 4])
    };
  }
  tables.push(table);
  return tables;
};

const processConnections = function(results, state) {
  let index = 0;
  const tables = [];
  // bodyId, pre, post, name, status, conInfo
  const headerdata = [
    new SimpleCellWrapper(index++, 'bodyId'),
    new SimpleCellWrapper(index++, 'pre'),
    new SimpleCellWrapper(index++, 'post'),
    new SimpleCellWrapper(index++, 'name'),
    new SimpleCellWrapper(index++, 'status')
    // new SimpleCellWrapper(index++, 'conInfo')
  ];

  const data = [];
  const table = {
    header: headerdata,
    body: data,
    name: 'Neurons with classification ' + state.clusterName,
    sortIndices: new Set([0, 1, 2, 3, 4, 5])
  };

  results.records.forEach(function(record) {
    const bodyId = record.get('bodyId');
    const pre = record.get('pre');
    const post = record.get('post');
    const name = record.get('name');
    const status = record.get('status');
    const conInfo = record.get('conInfo');

    const conInfoObject = JSON.parse(conInfo);

    let inputs = '';
    let outputs = '';
    let breakdown = {};
    Object.keys(conInfoObject).forEach(conType => {
      conInfoObject[conType]['pre'] = (conInfoObject[conType]['pre'] * 1.0) / pre;
      conInfoObject[conType]['post'] = (conInfoObject[conType]['post'] * 1.0) / post;
      if (conInfoObject[conType]['pre'] > 0.1) {
        if (outputs.length > 0) {
          outputs = outputs + ',' + conType;
        } else {
          outputs = conType;
        }
        breakdown[conType]['pre'] = conInfoObject[conType]['pre'];
        breakdown[conType]['post'] = conInfoObject[conType]['post'];
      }
      if (conInfoObject[conType]['post'] > 0.1) {
        if (inputs.length > 0) {
          inputs = inputs + ',' + conType;
        } else {
          inputs = conType;
        }
        breakdown[conType]['pre'] = conInfoObject[conType]['pre'];
        breakdown[conType]['post'] = conInfoObject[conType]['post'];
      }
    });

    const combo = inputs + '|' + outputs;

    data.push([
      new SimpleCellWrapper(index++, JSON.stringify(bodyId)),
      new SimpleCellWrapper(index++, JSON.stringify(pre)),
      new SimpleCellWrapper(index++, JSON.stringify(post)),
      new SimpleCellWrapper(index++, JSON.stringify(name)),
      new SimpleCellWrapper(index++, JSON.stringify(status))
      // new SimpleCellWrapper(index++, JSON.stringify(conInfo))
    ]);
  });

  tables.push(table);
  return tables;
};

const processGroupResults = function(results, state) {
  let index = 0;
  const tables = [];

  const headerdata = [new SimpleCellWrapper(index++, 'clusterName')];

  const data = [];
  const table = {
    header: headerdata,
    body: data,
    name: 'Cluster names for neurons.',
    sortIndices: new Set([0, 1])
  };

  results.records.forEach(function(record) {
    const clusterName = record.get('n.clusterName');
    const clusterQuery =
      'MATCH (n:`' + state.dataset + '-Neuron`{clusterName:"' + clusterName + '"}) RETURN n.bodyId';

    const neoCluster = {
      queryStr: clusterQuery,
      callback: processCluster,
      isChild: true,
      state: {
        clusterName: clusterName
      }
    };

    data.push([
      new SimpleCellWrapper(
        index++,
        <ClickableQuery neoQueryObj={neoCluster}>{clusterName}</ClickableQuery>
      )
    ]);
  });

  tables.push(table);
  return tables;
};

const processCluster = function(results, state) {
  let index = 0;
  const tables = [];

  const headerdata = [new SimpleCellWrapper(index++, 'bodyId')];

  const data = [];
  const table = {
    header: headerdata,
    body: data,
    name: 'Neurons with classification ' + state.clusterName,
    sortIndices: new Set([0])
  };

  results.records.forEach(function(record) {
    const bodyId = record.get('n.bodyId');

    data.push([new SimpleCellWrapper(index++, parseInt(bodyId))]);
  });

  tables.push(table);
  return tables;
};

export default function(dataset, bodyId, getGroups, limitBig, statusFilters) {
  let query;
  if (!getGroups) {
    const similarQuery =
      "MATCH (m:Meta{dataset:'" +
      dataset +
      "'}) WITH m.superLevelRois AS rois MATCH (n:`" +
      dataset +
      '-Neuron`{bodyId:' +
      bodyId +
      '}) WITH n.clusterName AS cn, rois MATCH (n:`' +
      dataset +
      '-Neuron`{clusterName:cn}) RETURN n.bodyId, n.name, n.status, n.pre, n.post, n.roiInfo, rois, n.clusterName';
    // let params = {
    //     dataset: dataset,
    //     statuses: statusFilters
    // };
    // if (limitBig === "true") {
    //     params["pre_threshold"] = 2;
    // }

    query = {
      queryStr: similarQuery,
      // params: params,
      callback: processResults,
      state: {
        bodyId: bodyId,
        dataset: dataset
      }
    };
  } else {
    const groupsQuery = 'MATCH (n:`' + dataset + '-Neuron`) RETURN DISTINCT n.clusterName';

    query = {
      queryStr: groupsQuery,
      // params: params,
      callback: processGroupResults,
      state: {
        dataset: dataset
      }
    };
  }

  return query;
}
