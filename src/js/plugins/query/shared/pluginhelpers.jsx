import React from 'react';
// eslint-disable-next-line import/no-unresolved
import * as math from 'mathjs';
import NeuronRoiHeatMap, { ColorLegend } from 'plugins/MiniRoiHeatMap';
import NeuronRoiBarGraph, { MiniMitoBarGraph, MiniMitoByTypeBarGraph } from 'plugins/MiniRoiBarGraph';
import { pluginName, pluginAbbrev } from './SimpleConnectionsConstants';
import BodyId from '../visualization/BodyId';

/**
 * Creates a map of column identifier to column index. Column indices
 * are assigned according to the order in array. For example,
 *
 *  setColumnIndices(["id","name","size"])
 *
 * returns
 *
 *  {id:0, name:1, size:2}
 *
 * @export
 * @param {Array.<string>} propertyNames
 * @returns {Object.<string,number>}
 */
export function setColumnIndices(propertyNames) {
  const indexMap = {};
  propertyNames.forEach((p, index) => {
    indexMap[p] = index;
  });
  return indexMap;
}

/**
 * Produces an roi info object that includes the # of pre and post that
 * are not in the rois in roiList.
 *
 * @param {Object.<string,Object.<string,number>>} roiInfoObject
 * @param {Array.<string>} roiList
 * @param {number} preTotal
 * @param {number} postTotal
 * @returns {Object.<string,Object.<string,number>>}
 */
export function getRoiInfoObjectWithNoneCount(roiInfoObject, roiList, preTotal, postTotal) {
  if (!roiInfoObject) {
    return null;
  }
  // deep copy roi info object
  const newRoiInfoObject = JSON.parse(JSON.stringify(roiInfoObject));

  // calculate # pre and post in super rois (which are disjoint) to get total
  // number of synapses assigned to an roi
  let postInSuperRois = 0;
  let preInSuperRois = 0;
  Object.keys(newRoiInfoObject).forEach(roi => {
    // count all super ROIs except for None, because if they are added to the inSuperRois
    // total, they wont get added during the creation of the new None later in
    // this function. That will throw of the percentage calculations later.
    if (roiList.includes(roi) && roi !== 'None') {
      preInSuperRois += roiInfoObject[roi].pre || 0;
      postInSuperRois += roiInfoObject[roi].post || 0;
    }
  });

  // add this after the other rois have been summed.
  // records # pre and post that are not in rois
  newRoiInfoObject.None = {
    pre: preTotal - preInSuperRois,
    post: postTotal - postInSuperRois
  };

  return newRoiInfoObject;
}

/**
 * Creates a query object for performing the neuprint simpleconnections query.
 *
 * @export
 * @param {string} dataset
 * @param {boolean} isPost
 * @param {number} bodyId
 * @returns {Object}
 */
export function createSimpleConnectionQueryObject({ dataSet, isPost = false, queryId, queryName }) {
  const query = {
    dataSet, // <string> for the data set selected
    pluginCode: pluginAbbrev,
    pluginName,
    visProps: { paginateExpansion: true },
    parameters: {
      dataset: dataSet,
      find_inputs: isPost
    }
  };
  if (queryId) {
    query.parameters.neuron_id = parseInt(queryId, 10);
  } else if (queryName && queryName !== '') {
    query.parameters.neuron_name = queryName;
  } else {
    return null;
  }
  return query;
}

/**
 * Generates an roi heat map and bar graph for a neuron.
 *
 * @export
 * @param {Object.<string,Object.<string,number>>} roiInfoObject
 * @param {Array.<string>} roiList
 * @param {number} preTotal
 * @param {number} postTotal
 * @returns {Object.<string,JSX.Element>}
 */
export function generateRoiHeatMapAndBarGraph(roiInfoObject, roiList, preTotal, postTotal) {
  // we used to only calculate the 'None' ROI when one wasn't present in the
  // data returned from the server, eg:  if (!Object.keys(roiInfoObject).includes('None')).
  // This condition was removed, because the server was returning a value for None that didn't
  // match what we were expecting. Now we calculate None for all returned values.
  // WHAT A WASTE OF TIME!!!
  const roiInfoObjectWithNoneCount = getRoiInfoObjectWithNoneCount(
    roiInfoObject,
    roiList,
    preTotal,
    postTotal
  );

  if (!roiList.includes('None')) {
    roiList.push('None');
  }

  const heatMap = (
    <NeuronRoiHeatMap
      roiList={roiList}
      roiInfoObject={roiInfoObjectWithNoneCount}
      preTotal={preTotal}
      postTotal={postTotal}
    />
  );

  const barGraph = (
    <NeuronRoiBarGraph
      roiList={roiList}
      roiInfoObject={roiInfoObjectWithNoneCount}
      preTotal={preTotal}
      postTotal={postTotal}
    />
  );

  return { heatMap, barGraph };
}

export function generateMitoBarGraph(roiInfoObject, mitoTotal) {

   const barGraph = (
    <MiniMitoBarGraph roiInfoObject={roiInfoObject} mitoTotal={mitoTotal} />
  );
  return barGraph;
}

export function generateMitoByTypeBarGraph(roiInfoObject, mitoTotal) {

   const barGraph = (
    <MiniMitoByTypeBarGraph roiInfoObject={roiInfoObject} mitoTotal={mitoTotal} />
  );
  return barGraph;
}


/**
 * Returns body id in preferred format for table view. Incorporates a view skeleton link.
 *
 * @export
 * @param {string} dataset
 * @param {number} bodyId
 * @param {Object} actions
 * @param {Object} options
 * @param {string} options.color
 * @param {boolean} options.skeleton
 * @returns {Object}
 */
export function getBodyIdForTable(dataset, bodyId, actions, options) {
  // don't create the link if the bodyid is not a number.
  if (bodyId === '-') {
    return bodyId;
  }

  return {
    value: (
      <BodyId dataSet={dataset} actions={actions} options={options}>
        {bodyId}
      </BodyId>
    ),
    sortBy: bodyId
  };
}

/**
 *
 *
 * @export
 * @param {Array.<number>} vectorA
 * @param {Array.<number>} vectorB
 * @param {number} sumOfVector
 * @param {number} precision
 * @returns
 */
export function getScore(vectorA, vectorB, sumOfVector, precision) {
  return math.round(math.sum(math.abs(math.subtract(vectorA, vectorB))) / sumOfVector, precision);
}

/**
 * Returns similarity scores for two vectors, one for each neuron, representing input/output distribution
 * within ROIs. Distance is defined as sum of absolute differences between the queriedBodyVector and the inputVector.
 * Output contains inputScore, outputScore, and totalScore, which is the average of the two.
 *
 * @export
 * @param {Array.<number>} inputVector
 * @param {Array.<number>} queriedBodyVector
 * @returns {Object.<string,number>}
 */
export function computeSimilarity(inputVector, queriedBodyVector) {
  if (inputVector === undefined) {
    throw new Error('computeSimilarity: inputVector is not defined.');
  }
  if (queriedBodyVector === undefined) {
    throw new Error('computeSimilarity: queriedBodyVector is not defined.');
  }
  inputVector.forEach(v => {
    if (Number.isNaN(v)) {
      throw new Element('computeSimilarity: inputVector contains NaN.');
    }
  });
  queriedBodyVector.forEach(v => {
    if (Number.isNaN(v)) {
      throw new Element('computeSimilarity: queriedBodyVector contains NaN.');
    }
  });

  const totalNumberOfRois = queriedBodyVector.length / 2;
  // input score (pre)
  const inputScore = getScore(
    queriedBodyVector.slice(totalNumberOfRois),
    inputVector.slice(totalNumberOfRois),
    2.0,
    4
  );
  // output score (post)
  const outputScore = getScore(
    queriedBodyVector.slice(0, totalNumberOfRois),
    inputVector.slice(0, totalNumberOfRois),
    2.0,
    4
  );
  // total score
  const totalScore = getScore(queriedBodyVector, inputVector, 4.0, 4);
  return { inputScore, outputScore, totalScore };
}

function createConnectionDetailQueryObject(dataset, bodyIdA, bodyIdB, connectionWeight, roiList) {
  const cypher = `
MATCH (n :Segment {bodyId: ${bodyIdA}})-[x :ConnectsTo]->(b :Segment {bodyId: ${bodyIdB}})
RETURN x.roiInfo`;
  return {
    bodyIdA,
    bodyIdB,
    connectionWeight,
    roiList,
    cypher,
    dataset
  };
}

export function combineROIJSONStrings(original, added) {
  const originalObject = JSON.parse(original) || {};
  const addedObject = added !== '' ? JSON.parse(added) : {};
  const combined = {}; // ??????
  // loop over all keys in both the original and the addition.
  // for each pre & post, combine the numbers
  Object.entries(originalObject).forEach(([key, value]) => {
    if (!combined[key]) {
      combined[key] = {};
    }

    if (!combined[key].pre) {
      combined[key].pre = value.pre;
    } else {
      combined[key].pre += value.pre;
    }
    if (!combined[key].post) {
      combined[key].post = value.post;
    } else {
      combined[key].post += value.post;
    }
  });

  Object.entries(addedObject).forEach(([key, value]) => {
    if (!combined[key]) {
      combined[key] = {};
    }

    if (!combined[key].pre) {
      combined[key].pre = value.pre;
    } else {
      combined[key].pre += value.pre;
    }
    if (!combined[key].post) {
      combined[key].post = value.post;
    } else {
      combined[key].post += value.post;
    }
  });

  return JSON.stringify(combined);
}

function combineRowsByType(rows, shouldCombine) {
  if (!shouldCombine) {
    return rows;
  }
  // TODO: Need to combine all the rows that share the same type, if the combinedByType
  // option is selected. This will be an issue for the roiInfoObjectJSON, so a simple
  // reducer probably wont work.
  const combinedLookup = {};
  rows.forEach(row => {
    // get the type
    const type = row[3];
    // add all values to the existing lookup
    if (!combinedLookup[type]) {
      combinedLookup[type] = row;
      combinedLookup[type][2] = '-';
      combinedLookup[type][4] = '-';
      combinedLookup[type][7] = '-';
    } else {
      combinedLookup[type][5] += row[5];
      combinedLookup[type][9] += row[9];
      combinedLookup[type][8] = combineROIJSONStrings(combinedLookup[type][8], row[8]);
      combinedLookup[type][10] += row[10];
      combinedLookup[type][11] += row[11];
      combinedLookup[type][13] += row[13];
    }
    // What do we do with the JSON?
  });
  return Object.values(combinedLookup).sort((a, b) => b[5] - a[5]);
}

/**
 * Creates a result for a table view of the simpleconnections query.
 *
 * @export
 * @param {string} dataset
 * @param {Object} apiResponse
 * @param {Object} actions
 * @param {function} submit
 * @param {boolean} isInputs // indicates whether or not this is a list of inputs to the queried neuron
 * @param {boolean} includeWeightHP // indicates whether or not the table should include high-precision weights
 * @param {boolean} combinedByType // indicates whether to combine all rows based on their type.
 * @returns {Object}
 */
// TODO: explicitly pass required actions to prevent future bugs
export function createSimpleConnectionsResult(
  dataset,
  apiResponse,
  actions,
  submit,
  isInputs,
  includeWeightHP = false,
  combinedByType = false
) {
  let columnNames;

  if (includeWeightHP) {
    columnNames = [
      'expand',
      'bodyId',
      'type',
      'name',
      'status',
      'connectionWeight',
      'connectionWeightHP',
      'expectedRange',
      'post',
      'pre',
      'size',
      'roiHeatMap',
      'roiBarGraph'
    ];
  } else {
    columnNames = [
      'expand',
      'bodyId',
      'type',
      'name',
      'status',
      'connectionWeight',
      'expectedRange',
      'post',
      'pre',
      'size',
      'roiHeatMap',
      'roiBarGraph'
    ];
  }
  const indexOf = setColumnIndices(columnNames);

  const combined = combineRowsByType(apiResponse.data, combinedByType);

  // Get the total number of connections, by running a reduce over the
  // data array.
  // TODO: Probably should have total for high confidence as well.
  const totalConnections = combined.reduce((acc, row) => acc + row[5], 0);

  // get the orphan rate
  let tracedConns = 0;
  let totalConns = 0;

  if (!isInputs) {
    combined.forEach(row => {
      const [, , , , , connectionWeight, , status] = row;

      if (status === 'Traced') {
        tracedConns += connectionWeight;
      }
      totalConns += connectionWeight;
    });
  }

  const data = combined.map(row => {
    const [
      queriedName,
      ,
      name,
      type,
      bodyId,
      connectionWeight,
      bodyIdQueried,
      status,
      roiInfoObjectJSON,
      size,
      preTotal,
      postTotal,
      roiList,
      connectionWeightHP
    ] = row;
    const roiInfoObject = roiInfoObjectJSON !== '' ? JSON.parse(roiInfoObjectJSON) : {};

    // make sure none is added to the rois list.
    roiList.push('None');

    const converted = [];
    if (includeWeightHP) {
      converted[indexOf.connectionWeightHP] = connectionWeightHP;
    }

    converted[indexOf.expectedRange] = '-';
    if (!isInputs) {
      if (status === 'Traced') {
        let expstr = '?';
        if (tracedConns > 0) {
          const expval = Math.round(connectionWeight * (totalConns / tracedConns));
          expstr = expval.toString();
        }

        converted[indexOf.expectedRange] = `${connectionWeight.toString()} - ${expstr}`;
      } else {
        converted[indexOf.expectedRange] = '';
      }
    }

    if (isInputs) {
      converted[indexOf.expand] = createConnectionDetailQueryObject(
        dataset,
        bodyId,
        bodyIdQueried,
        connectionWeight,
        roiList
      );
    } else {
      converted[indexOf.expand] = createConnectionDetailQueryObject(
        dataset,
        bodyIdQueried,
        bodyId,
        connectionWeight,
        roiList
      );
    }

    const connectionPercentage = ((connectionWeight * 100) / totalConnections).toFixed(2);

    converted[indexOf.bodyId] = getBodyIdForTable(dataset, bodyId, actions);
    converted[indexOf.name] = name;
    converted[indexOf.type] = type;
    converted[indexOf.status] = status;
    converted[indexOf.connectionWeight] = {
      value: `${connectionWeight} (${connectionPercentage}%)`,
      sortBy: connectionWeight
    };
    converted[indexOf.size] = size;

    const { heatMap, barGraph } = generateRoiHeatMapAndBarGraph(
      roiInfoObject,
      roiList,
      preTotal,
      postTotal
    );
    converted[indexOf.roiHeatMap] = heatMap;
    converted[indexOf.roiBarGraph] = barGraph;

    if (combinedByType) {
      const postQuery = createSimpleConnectionQueryObject({
        dataSet: dataset,
        isPost: true,
        queryName: type
      });

      if (postQuery) {
        converted[indexOf.post] = {
          value: postTotal,
          action: () => submit(postQuery)
        };
      } else {
        converted[indexOf.post] = postTotal;
      }

      const preQuery = createSimpleConnectionQueryObject({
        dataSet: dataset,
        queryName: type
      });

      if (preQuery) {
        converted[indexOf.pre] = {
          value: preTotal,
          action: () => submit(preQuery)
        };
      } else {
        converted[indexOf.pre] = preTotal;
      }
    } else {
      const postQuery = createSimpleConnectionQueryObject({
        dataSet: dataset,
        isPost: true,
        queryId: bodyId
      });
      converted[indexOf.post] = {
        value: postTotal,
        action: () => submit(postQuery)
      };

      const preQuery = createSimpleConnectionQueryObject({
        dataSet: dataset,
        queryId: bodyId
      });
      converted[indexOf.pre] = {
        value: preTotal,
        action: () => submit(preQuery)
      };
    }

    // put the queried id at the beginning of the column so that we can use
    // it for later filtering/sorting
    converted.unshift(bodyIdQueried);
    converted.unshift(queriedName);

    return converted;
  });

  const columns = [];
  if (includeWeightHP) {
    columns[indexOf.connectionWeightHP] = '#connections (high-confidence)';
  }

  columns[indexOf.bodyId] = 'id';
  columns[indexOf.type] = 'type';
  columns[indexOf.name] = 'instance';
  columns[indexOf.status] = 'status';
  columns[indexOf.connectionWeight] = '#connections (% of total)';
  columns[indexOf.expectedRange] = 'expected range';
  columns[indexOf.post] = 'inputs (#post)';
  columns[indexOf.pre] = 'outputs (#pre)';
  columns[indexOf.size] = '#voxels';
  columns[indexOf.roiHeatMap] = (
    <div>
      brain region heatmap <ColorLegend />
    </div>
  );
  columns[indexOf.roiBarGraph] = 'brain region breakdown';
  /* eslint-enable prefer-destructuring */

  return {
    columns,
    data,
    debug: apiResponse.debug
  };
}

const pluginHelpers = {
  setColumnIndices,
  createSimpleConnectionQueryObject,
  generateRoiHeatMapAndBarGraph,
  getBodyIdForTable,
  computeSimilarity,
  createSimpleConnectionsResult
};

export default pluginHelpers;
