/*
 * Supports simple, custom neo4j query.
*/
import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import randomColor from 'randomcolor';
import { withRouter } from 'react-router';

import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import { withStyles } from '@material-ui/core/styles';

import { submit } from 'actions/plugins';
import { getQueryString } from 'helpers/queryString';
import { LoadQueryString, SaveQueryString } from '../../helpers/qsparser';
import { setUrlQS } from '../../actions/app';

const styles = () => ({
  textField: {
    width: 300
  },
  button: {
    margin: 4,
    display: 'block'
  },
  formControl: {}
});

const pluginName = 'CustomQuery';

class CustomQuery extends React.Component {
  static get queryName() {
    return 'Custom';
  }

  static get queryDescription() {
    return 'Enter custom Neo4j Cypher query';
  }

  constructor(props) {
    super(props);
    var initqsParams = {
      textValue: ''
    };
    var qsParams = LoadQueryString(
      'Query:' + this.constructor.queryName,
      initqsParams,
      this.props.urlQueryString
    );
    this.state = {
      qsParams: qsParams
    };
  }

  processResults = (query, apiResponse) => {
    if (apiResponse.data) {
      return {
        columns: apiResponse.columns,
        data: apiResponse.data,
        debug: apiResponse.debug
      };
    } else {
      return {
        columns: [],
        data: [],
        debug: ''
      };
    }
  };

  processRequest = () => {
    const { dataSet, actions, history } = this.props;
    const { textValue } = this.state.qsParams;

    const query = {
      dataSet,
      cypherQuery: textValue,
      visType: 'SimpleTable',
      plugin: pluginName,
      parameters: {},
      title: 'Custom query',
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

  handleChange = event => {
    const oldParams = this.state.qsParams;
    oldParams.textValue = event.target.value;
    this.props.actions.setURLQs(SaveQueryString('Query:' + this.constructor.queryName, oldParams));
    this.setState({
      qsParams: oldParams
    });
  };

  catchReturn = event => {
    // submit request if user presses enter
    if (event.keyCode === 13) {
      event.preventDefault();
      this.processRequest();
    }
  };

  render() {
    const { classes } = this.props;
    return (
      <FormControl className={classes.formControl}>
        <TextField
          label="Custom Cypher Query"
          multiline
          value={this.state.qsParams.textValue}
          rows={1}
          rowsMax={4}
          className={classes.textField}
          onChange={this.handleChange}
          onKeyDown={this.catchReturn}
        />
        <Button
          variant="contained"
          className={classes.button}
          onClick={this.processRequest}
          disabled={!(this.state.qsParams.textValue.length > 0)}
          color="primary"
        >
          Submit
        </Button>
      </FormControl>
    );
  }
}

CustomQuery.propTypes = {
  urlQueryString: PropTypes.string.isRequired,
  classes: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired
};

var CustomQueryState = function(state) {
  return {
    urlQueryString: state.app.get('urlQueryString'),
    isQuerying: state.query.isQuerying
  };
};

var CustomQueryDispatch = dispatch => ({
  actions: {
    submit: query => {
      dispatch(submit(query));
    },
    setURLQs: function(querystring) {
      dispatch(setUrlQS(querystring));
    }
  }
});

export default withStyles(styles)(
  withRouter(
    connect(
      CustomQueryState,
      CustomQueryDispatch
    )(CustomQuery)
  )
);
