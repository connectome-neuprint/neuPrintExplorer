import React from 'react';
import PropTypes from 'prop-types';
import PouchDB from 'pouchdb';
import { withStyles } from '@material-ui/core/styles';
import { NEURON_COLORS } from '@neuprint/vimo-sketches';
import Vimo from "./Vimo/Vimo";
import { getBodyIdForTable } from './shared/pluginhelpers';

const styles = () => ({
  textField: {
    border: '1px solid #ccc',
    borderRadius: '5px',
    margin: '0 0 1em 0',
    padding: '5px',
  },
  button: {
    margin: 4,
    display: 'block',
  },
});

const pluginName = 'MotifQuery';
const pluginAbbrev = 'mq';

export class VimoMotif extends React.Component {
  static get details() {
    return {
      name: pluginName,
      displayName: 'Motif Query',
      abbr: pluginAbbrev,
      experimental: false,
      category: 'top-level',
      description: 'Sketch interface to query the database for motifs',
      visType: 'MotifView',
    };
  }

  static fetchParameters() {
    return {};
  }

  static onCloseCallBack = (apiResponse, onError) => () => {
    const db = new PouchDB('neuprint_compartments');
    apiResponse.result.bodyIds.forEach((bodyId) => {
      db.get(`sk_${bodyId}`)
        .then((doc) => db.remove(doc))
        .catch((err) => onError(err));
    });
  };

  static processResults({ query, apiResponse, actions }) {
    if (apiResponse.data) {
      const bodyIds = new Set();
      const data = [];
      apiResponse.data.forEach((row, index) => {
        const motif = {
          motifId: index + 1,
          nodes: [],
					bodies: [],
        };

        row.forEach((item, itemIndex) => {
          const node = {
            cells: [
              apiResponse.columns[itemIndex],
              item.type || '-',
              getBodyIdForTable(query.ds, item.bodyId, actions, {
                skeleton: false,
              }),
              item.status,
            ],
            color: NEURON_COLORS[itemIndex],
          };
          motif.nodes.push(node);
					motif.bodies.push({id: item.bodyId, color: NEURON_COLORS[itemIndex] });
          bodyIds.add(item.bodyId);
        });

				motif.skeletonViewLink = () => {
					// actions.skeletonClear(query.ds);
					actions.skeletonAddBodiesandOpen(motif.bodies, query.ds, null, {replace: true});
				};
        data.push(motif);
      });
      return {
        columns: ['Node Key', 'Type', 'Body Id', 'Status'],
        data,
        debug: apiResponse.debug,
        title: 'Motif Search',
        bodyIds: Array.from(bodyIds),
      };
    }
    return {
      columns: [],
      data: [],
      debug: '',
    };
  }

  constructor(props) {
    super(props);
    this.state = {};
  }

  processRequest = (cypher) => {
    const { dataSet, submit } = this.props;
    const query = {
      dataSet, // <string> for the data set selected
      plugin: pluginName, // <string> the name of this plugin.
      pluginCode: pluginAbbrev,
      visProps: {
        rowsPerPage: 25,
      },
      parameters: {
        cypherQuery: cypher,
        dataset: dataSet,
      },
    };
    submit(query);
  };

  render() {
    const { dataSet, isQuerying, token, vimoServer } = this.props;
    // const dataServer = window.location.origin;
    const dataServer = 'https://neuprint.janelia.org';
    const dataVersion = dataSet;
    return (
		<>
      { vimoServer && vimoServer !== '' ? (
      <Vimo
        dataServer={dataServer}
        dataVersion={dataVersion}
        token={token}
        isQuerying={isQuerying}
        processRequest={this.processRequest}
        vimoServer={vimoServer}
        />) : (<span>Loading...</span>
      )}
      <b>Powered by <a href="https://vcg.seas.harvard.edu/publications/vimo">VIMO</a>, developed by the <a href="https://vcg.seas.harvard.edu/">Visual Computing Group</a> at Harvard.</b>
		</>
    );
  }
}

VimoMotif.propTypes = {
  isQuerying: PropTypes.bool.isRequired,
  dataSet: PropTypes.string.isRequired,
  submit: PropTypes.func.isRequired,
  token: PropTypes.string.isRequired,
	vimoServer: PropTypes.string.isRequired,
};

export default withStyles(styles)(VimoMotif);
