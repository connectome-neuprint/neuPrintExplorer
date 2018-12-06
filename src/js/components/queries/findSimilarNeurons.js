import * as math from 'mathjs';
import randomColor from 'randomcolor';

function computeSimilarity(inputVector, queriedBodyVector, totalNumberOfRois) {
  // input score (pre)
  const inputScore = math.round(
    math.sum(
      math.abs(
        math.subtract(
          queriedBodyVector.slice(totalNumberOfRois),
          inputVector.slice(totalNumberOfRois)
        )
      )
    ) / 2.0,
    4
  );
  // output score (post)
  const outputScore = math.round(
    math.sum(
      math.abs(
        math.subtract(
          queriedBodyVector.slice(0, totalNumberOfRois),
          inputVector.slice(0, totalNumberOfRois)
        )
      )
    ) / 2.0,
    4
  );
  // total score
  const totalScore = math.round(
    math.sum(math.abs(math.subtract(queriedBodyVector, inputVector))) / 4.0,
    4
  );

  return { inputScore, outputScore, totalScore };
}

// queries for getting neuron connections
function producePostQueryObject(bodyId, dataset, pluginName) {
  return {
    dataSet: dataset,
    queryString: '/npexplorer/simpleconnections',
    visType: 'SimpleTable',
    plugin: pluginName,
    parameters: {
      dataset,
      find_inputs: true,
      neuron_id: bodyId
    },
    title: `Connections to bodyID=${bodyId}`,
    menuColor: randomColor({ luminosity: 'light', hue: 'random' }),
    processResults: this.processConnections
  };
}

function producePreQueryObject(bodyId, dataset, pluginName) {
  return {
    dataSet: dataset,
    queryString: '/npexplorer/simpleconnections',
    visType: 'SimpleTable',
    plugin: pluginName,
    parameters: {
      dataset,
      find_inputs: false,
      neuron_id: bodyId
    },
    title: `Connections from bodyID=${bodyId}`,
    menuColor: randomColor({ luminosity: 'light', hue: 'random' }),
    processResults: this.processConnections
  };
}

const main = { computeSimilarity, producePreQueryObject, producePostQueryObject };

export default main;
