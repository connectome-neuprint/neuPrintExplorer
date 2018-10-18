/*
 * Supports simple, custom neo4j query.
*/

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Select from 'react-select';

import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import { withStyles } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import TextField from '@material-ui/core/TextField';

import NeuronHelp from '../NeuronHelp.react';
import NeuronFilter from '../NeuronFilter.react';
import { parseResults } from '../../neo4jqueries/neuronsInROIs';
//import _ from "underscore";
import { setUrlQS } from '../../actions/app';
import { LoadQueryString, SaveQueryString } from '../../helpers/qsparser';

const styles = theme => ({
  textField: {},
  formControl: {
    margin: theme.spacing.unit,
    minWidth: 250,
    maxWidth: 300
  },
  chips: {
    display: 'flex',
    flexWrap: 'wrap'
  },
  chip: {
    margin: theme.spacing.unit / 4
  },
  select: {
    fontFamily: theme.typography.fontFamily,
    margin: '0.5em 0 1em 0',
  },
});

class NeuronsInROIs extends React.Component {
  static get queryName() {
    return 'Find neurons';
  }

  static get queryDescription() {
    return 'Find neurons that have inputs or outputs in ROIs';
  }

  constructor(props) {
    super(props);
    var initqsParams = {
      InputROIs: [],
      OutputROIs: [],
      neuronsrc: ''
    };
    var qsParams = LoadQueryString(
      'Query:' + this.constructor.queryName,
      initqsParams,
      this.props.urlQueryString
    );
    this.state = {
      qsParams: qsParams,
      limitBig: true,
      statusFilters: []
    };
  }

  processRequest = () => {
    let params = {
      dataset: this.props.datasetstr,
      input_ROIs: this.state.qsParams.InputROIs,
      output_ROIs: this.state.qsParams.OutputROIs,
      statuses: this.state.statusFilters
    };
    if (this.state.qsParams.neuronsrc !== '') {
      if (isNaN(this.state.qsParams.neuronsrc)) {
        params['neuron_name'] = this.state.qsParams.neuronsrc;
      } else {
        params['neuron_id'] = parseInt(this.state.qsParams.neuronsrc);
      }
    }
    if (this.state.limitBig === 'true') {
      params['pre_threshold'] = 2;
    }

    let query = {
      queryStr: '/npexplorer/findneurons',
      params: params,
      callback: parseResults,
      state: {
        neuronSrc: this.state.qsParams.neuronsrc,
        outputROIs: this.state.qsParams.OutputROIs,
        inputROIs: this.state.qsParams.InputROIs,
        datasetstr: this.props.datasetstr
      }
    };

    this.props.callback(query);
  };

  handleChangeROIsIn = selected => {
    var rois = selected.map(item => item.value);
    if (selected === undefined) {
      rois = [];
    }
    var oldparams = this.state.qsParams;
    oldparams.InputROIs = rois;
    this.props.setURLQs(SaveQueryString('Query:' + this.constructor.queryName, oldparams));

    this.setState({ qsParams: oldparams });
  };

  handleChangeROIsOut = selected => {
    var rois = selected.map(item => item.value);
    if (selected === undefined) {
      rois = [];
    }
    var oldparams = this.state.qsParams;
    oldparams.OutputROIs = rois;
    this.props.setURLQs(SaveQueryString('Query:' + this.constructor.queryName, oldparams));

    this.setState({ qsParams: oldparams });
  };

  addNeuron = event => {
    var oldparams = this.state.qsParams;
    oldparams.neuronsrc = event.target.value;
    this.props.setURLQs(SaveQueryString('Query:' + this.constructor.queryName, oldparams));
    this.setState({ qsParams: oldparams });
  };

  loadNeuronFilters = params => {
    this.setState({ limitBig: params.limitBig, statusFilters: params.statusFilters });
  };

  render() {
    const { classes } = this.props;

    const inputOptions = this.props.availableROIs.map(name => {
      return {
        label: name,
        value: name,
      };
    });

    const inputValue = this.state.qsParams.InputROIs.map(roi => {
      return {
        label: roi,
        value: roi,
      };
    });

    const outputOptions = this.props.availableROIs.map(name => {
      return {
        label: name,
        value: name,
      };
    });

    const outputValue = this.state.qsParams.OutputROIs.map(roi => {
      return {
        label: roi,
        value: roi,
      };
    });


    return (
      <div>
        <InputLabel htmlFor="select-multiple-chip">Input ROIs</InputLabel>
        <Select
          className={classes.select}
          isMulti
          value={inputValue}
          onChange={this.handleChangeROIsIn}
          options={inputOptions}
          closeMenuOnSelect={false}
        />
        <InputLabel htmlFor="select-multiple-chip">Output ROIs</InputLabel>
        <Select
          className={classes.select}
          isMulti
          value={outputValue}
          onChange={this.handleChangeROIsOut}
          options={outputOptions}
          closeMenuOnSelect={false}
        />
        <FormControl className={classes.formControl}>
          <NeuronHelp>
            <TextField
              label="Neuron name (optional)"
              multiline
              rows={1}
              value={this.state.qsParams.neuronsrc}
              rowsMax={4}
              className={classes.textField}
              onChange={this.addNeuron}
            />
          </NeuronHelp>
          <NeuronFilter callback={this.loadNeuronFilters} datasetstr={this.props.datasetstr} />
        </FormControl>

        <Button variant="contained" onClick={this.processRequest}>
          Submit
        </Button>
      </div>
    );
  }
}

NeuronsInROIs.propTypes = {
  callback: PropTypes.func.isRequired,
  disable: PropTypes.bool,
  setURLQs: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired,
  datasetstr: PropTypes.string.isRequired,
  theme: PropTypes.object.isRequired,
  urlQueryString: PropTypes.string.isRequired,
  availableROIs: PropTypes.array.isRequired
};

var NeuronsInROIsState = function(state) {
  return {
    urlQueryString: state.app.get('urlQueryString')
  };
};

var NeuronsInROIsDispatch = function(dispatch) {
  return {
    setURLQs: function(querystring) {
      dispatch(setUrlQS(querystring));
    }
  };
};

export default withStyles(styles, { withTheme: true })(
  connect(
    NeuronsInROIsState,
    NeuronsInROIsDispatch
  )(NeuronsInROIs)
);
