/*
 * Query to find partners for a given body and the completeness of those tracings.
*/
import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import randomColor from 'randomcolor';

import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

import { submit } from 'actions/plugins';
import { getQueryObject, getQueryString, setQueryString } from 'helpers/queryString';

const pluginName = 'Partner Completeness';

// ?! commit; make viz plugin that takes the information and produce a double table view

const styles = theme => ({
  select: {
    fontFamily: theme.typography.fontFamily,
    margin: '0.5em 0 1em 0'
  }
});

class PartnerCompleteness extends React.Component {
  constructor(props) {
    super(props);
    const qsParams = getQueryObject();
    // set the default state for the query input.
    this.state = {
      bodyId: qsParams.bodyId || ''
    };
  }

  static get queryName() {
    return pluginName;
  }

  static get queryDescription() {
    return 'Show all connections to and from selected neuron and show reconstruction completeness.';
  }

  processResults = (dataSet, apiResponse) => {
    const data = apiResponse.data.map(row => {
      return [row[0], row[1], row[2], row[3], row[4], row[5], row[6]];
    });

    return {
      columns: ['id', 'name', 'in or out', '#connections', 'status', '#pre', '#post'],
      data,
      debug: apiResponse.debug
    };
  };

  // creates query object and sends to callback
  processRequest = () => {
    const { dataSet, actions, history } = this.props;
    let cypher =
      'MATCH (n :`' +
      dataSet +
      '-Segment` {bodyId: ' +
      this.state.bodyId +
      '})-[x:ConnectsTo]-(m) RETURN m.bodyId, m.name, CASE WHEN startnode(x).bodyId = ' +
      this.state.bodyId +
      ' THEN "output" ELSE "input" END, x.weight, m.status, m.pre, m.post ORDER BY x.weight DESC';

    const query = {
      dataSet,
      queryString: '/custom/custom',
      visType: 'SimpleTable',
      plugin: pluginName,
      parameters: { cypher: cypher },
      title: 'Tracing completeenss of connections to/from ' + this.state.bodyId,
      menuColor: randomColor({ luminosity: 'light', hue: 'random' }),
      processResults: this.processResults
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
      bodyId
    });

    this.setState({ bodyId });
  };

  render() {
    const { classes, isQuerying } = this.props;
    const { bodyId } = this.state;
    return (
      <div>
        <TextField
          label="Body Id"
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
  callback: PropTypes.func.isRequired,
  datasetstr: PropTypes.string.isRequired,
  classes: PropTypes.object.isRequired
};

var PartnerCompletenessState = function(state) {
  return {
    isQuerying: state.query.isQuerying
  };
};

// The submit action which will accept your query, execute it and
// store the results for view plugins to display.
var PartnerCompletenessDispatch = dispatch => ({
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
