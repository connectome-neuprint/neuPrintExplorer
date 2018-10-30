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

      data.push([
        new SimpleCellWrapper(index++, parseInt(bodyId)),
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
        bodyId: bodyId
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
