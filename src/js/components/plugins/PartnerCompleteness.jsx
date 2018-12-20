/*
 * Query to find partners for a given body and the completeness of those tracings.
 */
import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import randomColor from 'randomcolor';
import Immutable from 'immutable';

import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

import { submit } from 'actions/plugins';
import { getSiteParams, getQueryString, setQueryString } from 'helpers/queryString';

const pluginName = 'Partner Completeness';

const styles = theme => ({
  select: {
    fontFamily: theme.typography.fontFamily,
    margin: '0.5em 0 1em 0'
  },
  textField: {
    marginBottom: '1em'
  }
});

class PartnerCompleteness extends React.Component {
  static get queryName() {
    return pluginName;
  }

  static get queryCategory() {
    return 'recon';
  }

  static get queryDescription() {
    return 'Show all connections to and from selected neuron and show reconstruction completeness.';
  }

  static get isExperimental() {
    return true;
  }

  processResults = (dataSet, apiResponse) => {
    const data = apiResponse.data.map(row => [
      row[0],
      row[1],
      row[2],
      row[3],
      row[4],
      row[5],
      row[6],
      row[7],
      row[8],
      row[9],
      row[10]
    ]);

    return {
      columns: ['id', 'name', 'isinput', '#connections', 'status', '#pre', '#post'],
      data,
      debug: apiResponse.debug,
      bodyId: apiResponse.bodyId
    };
  };

  // creates query object and sends to callback
  processRequest = () => {
    const { dataSet, actions, history, location } = this.props;
    const qsParams = getSiteParams(location);
    const { bodyId } = qsParams.getIn(['input', 'pc'], Immutable.Map({})).toJS();
    const cypher = `MATCH (n :\`${dataSet}-Segment\` {bodyId: ${bodyId}})-[x:ConnectsTo]-(m) RETURN m.bodyId, m.name, CASE WHEN startnode(x).bodyId = ${bodyId} THEN false ELSE true END, x.weight, m.status, m.pre, m.post, n.name, n.pre, n.post, n.status ORDER BY x.weight DESC`;

    const query = {
      dataSet,
      queryString: '/custom/custom',
      visType: 'PartnerCompletenessView',
      plugin: pluginName,
      parameters: { cypher },
      title: `Tracing completeness of connections to/from ${bodyId}`,
      menuColor: randomColor({ luminosity: 'light', hue: 'random' }),
      processResults: this.processResults,
      bodyId
    };
    actions.submit(query);
    history.push({
      pathname: '/results',
      search: getQueryString()
    });
    return query;
  };

  addNeuron = event => {
    const bodyId = event.target.value;
    setQueryString({
      'input': {
        pc: {
          bodyId
        }
      }
    });
  };

  render() {
    const { classes, isQuerying, location } = this.props;
    const qsParams = getSiteParams(location);
    const { bodyId } = qsParams.getIn(['input', 'pc'], Immutable.Map({})).toJS();
    return (
      <div>
        <TextField
          label="Body Id"
          fullWidth
          value={bodyId || ''}
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
  actions: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  isQuerying: PropTypes.bool.isRequired,
  classes: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired
};

const PartnerCompletenessState = state => ({
  isQuerying: state.query.isQuerying
});

// The submit action which will accept your query, execute it and
// store the results for view plugins to display.
const PartnerCompletenessDispatch = dispatch => ({
  actions: {
    submit: query => {
      dispatch(submit(query));
    }
  }
});

export default withRouter(
  withStyles(styles)(
    connect(
      PartnerCompletenessState,
      PartnerCompletenessDispatch
    )(PartnerCompleteness)
  )
);
