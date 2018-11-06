/*
 * Find similar neurons in a dataset.
*/

import React from 'react';
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import TextField from '@material-ui/core/TextField';
import PropTypes from 'prop-types';
import NeuronFilter from '../NeuronFilter.react';
import queryFindSimilarNeurons from '../../neo4jqueries/findSimilarNeurons.js';
import { withStyles } from '@material-ui/core/styles';
import { setUrlQS } from '../../actions/app';
import { connect } from 'react-redux';
import { LoadQueryString, SaveQueryString } from '../../helpers/qsparser';

const styles = theme => ({
  textField: {
    minWidth: 250,
    maxWidth: 300
  },
  formControl: {
    margin: theme.spacing.unit,
    minWidth: 250,
    maxWidth: 300
  },
  chips: {
    display: 'flex',
    flexWrap: 'wrap'
  }
});
class FindSimilarNeurons extends React.Component {
  static get queryName() {
    return 'Find Similar Neurons';
  }

  static get queryDescription() {
    return 'Find neurons that are similar to a neuron of interest in terms of their input and output locations (ROIs).';
  }

  constructor(props) {
    super(props);
    const initqsParams = {
      typeValue: 'input',
      bodyIds: '',
      names: '',
      getGroups: 'false'
    };
    const qsParams = LoadQueryString(
      'Query:' + this.constructor.queryName,
      initqsParams,
      this.props.urlQueryString
    );

    this.state = {
      qsParams: qsParams,
      limitBig: true
    };
  }

  loadNeuronFilters = params => {
    this.setState({
      limitBig: params.limitBig,
      statusFilters: params.statusFilters
    });
  };

  addNeuronBodyIds = event => {
    const oldParams = this.state.qsParams;
    oldParams.bodyIds = event.target.value;
    this.props.setURLQs(SaveQueryString('Query:' + this.constructor.queryName, oldParams));
    this.setState({
      qsParams: oldParams
    });
  };

  addNeuronNames = event => {
    const oldParams = this.state.qsParams;
    oldParams.names = event.target.value;
    this.props.setURLQs(SaveQueryString('Query:' + this.constructor.queryName, oldParams));
    this.setState({
      qsParams: oldParams
    });
  };

  setInputOrOutput = event => {
    const oldParams = this.state.qsParams;
    oldParams.typeValue = event.target.value;
    this.props.setURLQs(SaveQueryString('Query:' + this.constructor.queryName, oldParams));
    this.setState({
      qsParams: oldParams
    });
  };

  getGroups = event => {
    const oldParams = this.state.qsParams;
    oldParams.getGroups = event.target.checked === true ? 'true' : false;
    this.props.setURLQs(SaveQueryString('Query:' + this.constructor.queryName, oldParams));
    this.setState({
      qsParams: oldParams
    });
  };

  catchReturn = event => {
    // submit request if user presses enter
    if (event.keyCode === 13) {
      event.preventDefault();

      this.props.callback(
        queryFindSimilarNeurons(
          this.props.datasetstr,
          this.state.qsParams.bodyIds,
          this.state.qsParams.getGroups === 'true' ? true : false,
          this.state.qsParams.limitBig,
          this.state.qsParams.statusFilters
        )
      );
    }
  };

  render() {
    const { classes } = this.props;
    return (
      <div>
        <FormControl className={classes.formControl}>
          <TextField
            label="Neuron bodyId"
            multiline
            fullWidth
            rows={1}
            value={this.state.qsParams.bodyIds}
            disabled={this.state.qsParams.getGroups === 'true' ? true : false}
            rowsMax={4}
            className={classes.textField}
            onChange={this.addNeuronBodyIds}
            onKeyDown={this.catchReturn}
          />
        </FormControl>
        <FormControlLabel
          control={
            <Checkbox
              checked={this.state.qsParams.getGroups === 'true' ? true : false}
              onChange={this.getGroups}
              value="getGroups"
            />
          }
          label="Explore groups (provides a list of cluster names; click cluster names to view neuron body ids in that cluster)"
        />
        <NeuronFilter callback={this.loadNeuronFilters} datasetstr={this.props.datasetstr} />
        <Button
          variant="raised"
          color="primary"
          onClick={() => {
            this.props.callback(
              queryFindSimilarNeurons(
                this.props.datasetstr,
                this.state.qsParams.bodyIds,
                this.state.qsParams.getGroups === 'true' ? true : false,
                this.state.qsParams.limitBig,
                this.state.qsParams.statusFilters
              )
            );
          }}
        >
          Submit
        </Button>
      </div>
    );
  }
}

FindSimilarNeurons.propTypes = {
  callback: PropTypes.func.isRequired,
  datasetstr: PropTypes.string.isRequired,
  setURLQs: PropTypes.func.isRequired,
  urlQueryString: PropTypes.string.isRequired,
  classes: PropTypes.object.isRequired
};

const FindSimilarNeuronsState = function(state) {
  return {
    urlQueryString: state.app.get('urlQueryString')
  };
};

const FindSimilarNeuronsDispatch = function(dispatch) {
  return {
    setURLQs: function(querystring) {
      dispatch(setUrlQS(querystring));
    }
  };
};

export default withStyles(styles, { withTheme: true })(
  connect(
    FindSimilarNeuronsState,
    FindSimilarNeuronsDispatch
  )(FindSimilarNeurons)
);
