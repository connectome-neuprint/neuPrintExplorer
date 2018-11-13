/*
 * Supports simple, custom neo4j query.
*/
import React from 'react';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { LoadQueryString, SaveQueryString } from '../../helpers/qsparser';
import { connect } from 'react-redux';
import SimpleCellWrapper from '../../helpers/SimpleCellWrapper';
import { setUrlQS } from '../../actions/app';

const styles = () => ({
  textField: {
    width: 300
  },
  formControl: {}
});

class FreeForm extends React.Component {
  static get queryName() {
    return 'Custom';
  }

  static get queryDescription() {
    return 'Enter custom Neo4j Cypher query';
  }

  static parseResults(neoResults) {
    // load one table from neoResults
    var tables = [];
    var maindata = [];
    var headerdata = [];

    neoResults.records.forEach(function(record) {
      var recorddata = [];
      record.toArr().forEach(function(value) {
        var newval = value;
        recorddata.push(new SimpleCellWrapper(recorddata.length, JSON.stringify(newval)));
      });
      maindata.push(recorddata);
    });

    if (neoResults.columns.length > 0) {
      for (var i = 0; i < neoResults.columns.length; i++) {
        headerdata.push(new SimpleCellWrapper(i, neoResults.columns[i]));
      }
    }

    tables.push({
      header: headerdata,
      body: maindata,
      name: 'Custom Query'
    });

    return tables;
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

  processRequest = () => {
    let query = {
      queryStr: this.state.qsParams.textValue,
      callback: FreeForm.parseResults,
      state: {}
    };

    this.props.callback(query);
  };

  handleClick = event => {
    this.props.setURLQs(
      SaveQueryString('Query:' + this.constructor.queryName, { textValue: event.target.value })
    );
    this.setState({ qsParams: { textValue: event.target.value } });
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
          onChange={this.handleClick}
          onKeyDown={this.catchReturn}
        />
        {this.props.disable ? (
          <Button variant="contained" onClick={this.processRequest} disabled>
            Submit
          </Button>
        ) : (
          <Button variant="contained" onClick={this.processRequest}>
            Submit
          </Button>
        )}
      </FormControl>
    );
  }
}

FreeForm.propTypes = {
  callback: PropTypes.func.isRequired,
  disable: PropTypes.bool,
  urlQueryString: PropTypes.string.isRequired,
  classes: PropTypes.object.isRequired,
  setURLQs: PropTypes.func.isRequired
};

var FreeFormState = function(state) {
  return {
    urlQueryString: state.app.get('urlQueryString')
  };
};

var FreeFormDispatch = function(dispatch) {
  return {
    setURLQs: function(querystring) {
      dispatch(setUrlQS(querystring));
    }
  };
};

export default withStyles(styles)(
  connect(
    FreeFormState,
    FreeFormDispatch
  )(FreeForm)
);
