import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';

import SynapseSelection from 'containers/Skeleton/SynapseSelection';
import ToggleSynapses from 'containers/Skeleton/ToggleSynapses';

const cypherQuery =
  'MATCH (n :Neuron {bodyId: <BODYID>})-[x :ConnectsTo]-(m) RETURN x.weight AS weight, toString(startnode(x).bodyId) AS startId, startnode(x).type AS startType, toString(endnode(x).bodyId) AS endBody, endnode(x).type AS endType ORDER BY x.weight DESC';

export default function SynapseSelectionMenu(props) {
  const { open, bodyId, dataSet, synapseRadius } = props;

  const [synapses, setSynapses] = useState(null);
  const [errors, setError] = useState(null);


  useEffect(() => {
    function synapsesLoaded(result) {
      const inputs = {};
      const outputs = {};
      // loop over the data and pull out the inputs vs the outputs.
      // store them as separate arrays in the state. They will be used later
      // for the menu when picking which ones to display.
      result.data
        .sort((a, b) => a[0] > b[0]) // sort by weight
        .forEach(synapse => {
          // inputs are anything where the start node is not the current bodyid
          if (synapse[1] !== bodyId) {
            inputs[synapse[1]] = { weight: synapse[0], type: synapse[2] };
          }
          // outputs are anything where the end node is not the current bodyid
          if (synapse[3] !== bodyId) {
            outputs[synapse[3]] = { weight: synapse[0], type: synapse[4] };
          }
        });

      setSynapses({ inputs, outputs });
    }

    const finalQuery = cypherQuery.replace(/<BODYID>/, bodyId);
    fetch('/api/custom/custom?np_explorer=synapse_selection', {
      headers: {
        'content-type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({
        cypher: finalQuery,
        dataset: dataSet
      }),
      method: 'POST',
      credentials: 'include'
    })
      .then(result => result.json())
      .then(result => {
        if ('error' in result) {
          throw result.error;
        }
        synapsesLoaded(result);
      })
      .catch(error => setError(error));
  }, [bodyId, dataSet]);

  if (!open) {
    return null;
  }

  if (errors) {
    return <p>Error Loading synapses</p>;
  }

  if (synapses) {
    const synapseInputs = Object.entries(synapses.inputs)
      .sort((a, b) => b[1].weight - a[1].weight)
      .slice(0, 10) // pick the top ten for display
      .map(entry => (
        <SynapseSelection
          key={entry[0]}
          synapse={entry}
          isInput
          bodyId={bodyId}
          dataSet={dataSet}
          synapseRadius={synapseRadius}
        />
      ));
    const inputList = Object.entries(synapses.inputs)
      .sort((a, b) => b[1].weight - a[1].weight)
      .slice(0, 10).map(entry => entry[0]);;

    const synapseOutputs = Object.entries(synapses.outputs)
      .sort((a, b) => b[1].weight - a[1].weight)
      .slice(0, 10) // pick the top ten for display
      .map(entry => (
        <SynapseSelection
          key={entry[0]}
          synapse={entry}
          isInput={false}
          bodyId={bodyId}
          dataSet={dataSet}
          synapseRadius={synapseRadius}
        />
      ));

    const outputList = Object.entries(synapses.outputs)
      .sort((a, b) => b[1].weight - a[1].weight)
      .slice(0, 10).map(entry => entry[0]);;

    return (
      <>
        <ListItem>Inputs</ListItem>
        <ToggleSynapses
          synapseList={inputList}
          bodyId={bodyId}
          dataSet={dataSet}
          synapseRadius={synapseRadius}
        />
        <List>{synapseInputs}</List>
        <ListItem>Outputs</ListItem>
        <ToggleSynapses
          synapseList={outputList}
          bodyId={bodyId}
          dataSet={dataSet}
          synapseRadius={synapseRadius}
          isInput={false}
        />
        <List>{synapseOutputs}</List>
      </>
    );
  }

  return <p>Synapse Selection Loading...</p>;
}

SynapseSelectionMenu.propTypes = {
  open: PropTypes.bool.isRequired,
  bodyId: PropTypes.string.isRequired,
  synapseRadius: PropTypes.number.isRequired,
  dataSet: PropTypes.string.isRequired
};
