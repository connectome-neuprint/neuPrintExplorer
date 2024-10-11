/*
 * Query to find partners for a given body and the completeness of those tracings.
 */
import React from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

import { getBodyIdForTable } from './shared/pluginhelpers';

const styles = theme => ({
  select: {
    fontFamily: theme.typography.fontFamily,
    margin: '0.5em 0 1em 0'
  },
  textField: {
    marginBottom: '1em'
  }
});

const pluginName = 'PartnerCompleteness';
const pluginAbbrev = 'pc';

class PartnerCompleteness extends React.Component {
  static get details() {
    return {
      name: pluginName,
      displayName: 'Partner Completeness',
      abbr: pluginAbbrev,
      category: 'recon',
      description:
        'Show all connections to and from selected neuron and show reconstruction completeness.',
      visType: 'PartnerCompletenessView'
    };
  }

  static fetchParameters(params) {
    const { bodyId } = params;
    const cypherQuery = `MATCH (n :Segment {bodyId: ${bodyId}})-[x:ConnectsTo]-(m) RETURN m.bodyId, m.instance, m.type, CASE WHEN startnode(x).bodyId = ${bodyId} THEN false ELSE true END, x.weight, m.status, m.pre, m.post, n.instance, n.pre, n.post, n.status, n.type ORDER BY x.weight DESC`;
    return {
      cypherQuery,
      queryString: '/custom/custom?np_explorer=partner_completeness'
    };
  }

  static processResults({ query, apiResponse, actions }) {
    const data = apiResponse.data.map(row => [
      getBodyIdForTable(query.ds, row[0], actions), // bodyId
      row[1], // instance
      row[2], // type
      row[3], // isinput
      row[4], // weight
      row[5], // status
      row[6], // pre
      row[7], // post
      row[8], // instance
      row[9], // pre
      row[10], // post
      row[11], // status
      row[12] // type
    ]);

    return {
      columns: ['id', 'instance', 'type', 'isinput', '#connections', 'status', '#pre', '#post'], // TODO: these are wrong or missing.
      data,
      debug: apiResponse.debug,
      bodyId: apiResponse.bodyId,
      title: `Tracing completeness of connections to/from ${data[0][8]} (${query.pm.bodyId}) `
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      bodyId: ''
    };
  }

  // creates query object and sends to callback
  processRequest = () => {
    const { dataSet, submit } = this.props;
    const { bodyId } = this.state;

    const query = {
      dataSet,
      plugin: pluginName,
      pluginCode: pluginAbbrev,
      parameters: { dataset: dataSet, bodyId }
    };
    submit(query);
  };

  addNeuron = event => {
    this.setState({ bodyId: event.target.value });
  };

  render() {
    const { classes, isQuerying } = this.props;
    const { bodyId } = this.state;
    return (
      <div>
        <TextField
          label="Body Id"
          fullWidth
          value={bodyId}
          className={classes.textField}
          onChange={this.addNeuron}
        />

        <Button
          disabled={isQuerying}
          color="primary"
          variant="contained"
          onClick={this.processRequest}
        >
          Submit
        </Button>
      </div>
    );
  }
}

PartnerCompleteness.propTypes = {
  dataSet: PropTypes.string.isRequired,
  submit: PropTypes.func.isRequired,
  isQuerying: PropTypes.bool.isRequired,
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(PartnerCompleteness);
