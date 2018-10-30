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
import NeuronHelp from '../NeuronHelp.react';
import SimpleCellWrapper from '../../helpers/SimpleCellWrapper';
import { setUrlQS } from '../../actions/app';

const styles = () => ({
  textField: {},
  formControl: {}
});

function compareNeuronRows1plus(row1, row2) {
  var total = 0;
  var total2 = 0;
  for (let i = 1; i < row1.length; i++) {
    total += row1[i].getValue();
    total2 += row2[i].getValue();
  }

  return total2 - total;
}

function compareNeuronRows1(row1, row2) {
  return row2[1].getValue() - row1[1].getValue();
}

function compareNeuronRows2(row1, row2) {
  return row2[2].getValue() - row1[2].getValue();
}

class ROIsIntersectingNeurons extends React.Component {
  static get queryName() {
    return 'ROIs in Neuron';
  }

  static get queryDescription() {
    return 'Find ROIs that intersect a given neuron(s).  A putative name is given based on top two ROI inputs and outputs';
  }

  static parseResults(neoResults, state) {
    var tableBody = {};
    var tables = [];
    let index = 0;
    let headerdata = [
      new SimpleCellWrapper(index++, 'ROI name'),
      new SimpleCellWrapper(index++, 'inputs'),
      new SimpleCellWrapper(index++, 'outputs')
    ];

    neoResults.records.forEach(function(record) {
      let bodyid = record.get('bodyid');
      tableBody[bodyid] = {};
      tableBody[bodyid]['body'] = [];
      tableBody[bodyid]['name'] = record.get('bodyname');
      let rois = JSON.parse(record.get('roiInfo'));
      for (let roi in rois) {
        if (state.availableROIs.indexOf(roi) !== -1) {
          let numpre = rois[roi].pre;
          let numpost = rois[roi].post;
          tableBody[bodyid]['body'].push([
            new SimpleCellWrapper(index++, roi),
            new SimpleCellWrapper(index++, numpost),
            new SimpleCellWrapper(index++, numpre)
          ]);
        }
      }
    });

    for (let item in tableBody) {
      var data = tableBody[item]['body'];

      // grab name based on top two ids
      data.sort(compareNeuronRows1); // sort by post
      var postname = '';
      for (let i = 0; i < data.length; i++) {
        if (i === 2 || data[i][1].getValue() === null) {
          break;
        }
        postname += data[i][0].getValue();
      }
      data.sort(compareNeuronRows2); // sort by pre
      var prename = '';
      for (let i = 0; i < data.length; i++) {
        if (i === 2 || data[i][2] === null || data[i][2].getValue() === 0) {
          break;
        }
        prename += data[i][0].getValue();
      }

      data.sort(compareNeuronRows1plus); // sort by total
      var name =
        postname + '=>' + prename + ' | ' + tableBody[item].name + ' id=(' + String(item) + ')';
      var table = { header: headerdata, body: data, name: name };
      tables.push(table);
    }

    if (tables.length === 0) {
      tables.push({
        header: headerdata,
        body: [],
        name: 'ROIs in Body'
      });
    }

    return tables;
  }

  constructor(props) {
    super(props);
    var initqsParams = {
      neuronsrc: ''
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
    if (this.state.qsParams.neuronsrc !== '') {
      let params = { dataset: this.props.datasetstr };
      if (isNaN(this.state.qsParams.neuronsrc)) {
        params['neuron_name'] = this.state.qsParams.neuronsrc;
      } else {
        params['neuron_id'] = parseInt(this.state.qsParams.neuronsrc);
      }
      let query = {
        queryStr: '/npexplorer/roisinneuron',
        params: params,
        callback: ROIsIntersectingNeurons.parseResults,
        state: {
          availableROIs: this.props.availableROIs
        }
      };

      this.props.callback(query);
    }
  };

  handleClick = event => {
    this.props.setURLQs(
      SaveQueryString('Query:' + this.constructor.queryName, { neuronsrc: event.target.value })
    );
    this.setState({ qsParams: { neuronsrc: event.target.value } });
  };

  render() {
    const { classes } = this.props;
    return (
      <FormControl className={classes.formControl}>
        <NeuronHelp>
          <TextField
            label="Neuron name"
            multiline
            rows={1}
            value={this.state.qsParams.neuronsrc}
            rowsMax={4}
            className={classes.textField}
            onChange={this.handleClick}
          />
        </NeuronHelp>
        <Button variant="contained" onClick={this.processRequest}>
          Submit
        </Button>
      </FormControl>
    );
  }
}

ROIsIntersectingNeurons.propTypes = {
  callback: PropTypes.func.isRequired,
  disable: PropTypes.bool,
  urlQueryString: PropTypes.string.isRequired,
  classes: PropTypes.object.isRequired,
  setURLQs: PropTypes.func.isRequired,
  availableROIs: PropTypes.array.isRequired,
  datasetstr: PropTypes.string.isRequired
};

var ROIsIntersectingNeuronsState = function(state) {
  return {
    urlQueryString: state.app.get('urlQueryString')
  };
};

var ROIsIntersectingNeuronsDispatch = function(dispatch) {
  return {
    setURLQs: function(querystring) {
      dispatch(setUrlQS(querystring));
    }
  };
};

export default withStyles(styles)(
  connect(
    ROIsIntersectingNeuronsState,
    ROIsIntersectingNeuronsDispatch
  )(ROIsIntersectingNeurons)
);
