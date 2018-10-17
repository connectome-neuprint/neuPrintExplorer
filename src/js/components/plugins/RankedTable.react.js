/*
 * Implements table view that shows ordered strongest conenction to each neuron
 * and visually indicates the different classes of neurons.  (This is meant
 * to be similar to Lou's tables.)
*/
import React from 'react';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { LoadQueryString, SaveQueryString } from '../../helpers/qsparser';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormLabel from '@material-ui/core/FormLabel';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Typography from '@material-ui/core/Typography';
import { connect } from 'react-redux';
import NeuronHelp from '../NeuronHelp.react';
import RankCell from '../RankCell.react';
import SimpleCellWrapper from '../../helpers/SimpleCellWrapper';
import { setUrlQS } from '../../actions/app';

const styles = () => ({
  textField: {},
  formControl: {}
});

// available colors

var colorArray = [
  '#8dd3c7',
  '#ffffb3',
  '#bebada',
  '#fb8072',
  '#80b1d3',
  '#fdb462',
  '#b3de69',
  '#fccde5',
  '#d9d9d9',
  '#bc80bd',
  '#ccebc5',
  '#ffed6f'
];

/* color blind safe colros
#8e0152
#c51b7d
#de77ae
#f1b6da
#fde0ef
#f7f7f7
#e6f5d0
#b8e186
#7fbc41
#4d9221
#276419

or

#a6cee3
#1f78b4
#b2df8a
#33a02c
*/

class RankedTable extends React.Component {
  static get queryName() {
    return 'Ranked Table';
  }

  static get queryDescription() {
    return 'Show connections to neuron(s) ranked in order and colored by neuron class';
  }

  static parseResults(neoResults, state) {
    // create one comparison table
    var tables = [];
    var headerdata = [];
    var formattable = [];

    // create table info object
    var titlename = '';
    if (state.preOrPost === 'pre') {
      titlename = 'Outputs from ' + state.neuronSrc;
    } else {
      titlename = 'Inputs to ' + state.neuronSrc;
    }
    tables.push({
      header: headerdata,
      body: formattable,
      name: titlename
    });

    // grab type info and reverse mapping information
    var type2color = {};
    var reversecounts = {};
    neoResults.records.forEach(function(record) {
      var typeinfo = record.get('Neuron2Type');
      if (typeinfo !== null) {
        type2color[typeinfo] = 1;
      }

      var preid = record.get('pre_id');
      var node1id = record.get('m_id');
      if (
        (state.preOrPost === 'pre' && preid !== node1id) ||
        (state.preOrPost === 'post' && preid === node1id)
      ) {
        var body1 = record.get('Body1');
        var body2 = record.get('Body2');
        var weight = record.get('Weight');

        if (body2 in reversecounts) {
          reversecounts[String(body2)][String(body1)] = weight;
        } else {
          reversecounts[String(body2)] = {};
          reversecounts[String(body2)][String(body1)] = weight;
        }
      }
    });

    // load colors
    var count = 0;
    for (let type in type2color) {
      type2color[type] = count % colorArray.length;
      count += 1;
    }

    // load array of connections for each matching neuron
    var rowcomps = [];
    var lastbody = -1;
    var maxcols = 0;
    let index = 0;
    neoResults.records.forEach(function(record) {
      var body1 = record.get('Body1');

      // do not add reverse edges
      var preid = record.get('pre_id');
      var node1id = record.get('m_id');
      if (
        (state.preOrPost === 'pre' && preid === node1id) ||
        (state.preOrPost === 'post' && preid !== node1id)
      ) {
        if (lastbody != body1) {
          if (lastbody != -1) {
            formattable.push(rowcomps);
            if (rowcomps.length > maxcols) {
              maxcols = rowcomps.length;
            }
            rowcomps = [];
          }
          lastbody = body1;

          // set first cell element
          var neuronmatch1 = record.get('Neuron1');
          if (neuronmatch1 === null) {
            neuronmatch1 = body1;
          }
          index += 1;
          rowcomps.push(
            new SimpleCellWrapper(
              index,
              <Typography align="center">{neuronmatch1}</Typography>,
              false,
              neuronmatch1
            )
          );
        }

        var neuronmatch2 = record.get('Neuron2');
        if (neuronmatch2 === null) {
          neuronmatch2 = record.get('Body2');
        }

        // add custom cell element
        var weight = record.get('Weight');
        var typeinfo = record.get('Neuron2Type');

        var typecolor = '#ffffff';
        if (typeinfo !== null) {
          typecolor = colorArray[type2color[typeinfo]];
        }
        var body2 = record.get('Body2');
        var weight2 = 0;
        if (body2 in reversecounts && body1 in reversecounts[body2]) {
          weight2 = reversecounts[body2][body1];
        }

        index += 1;
        rowcomps.push(
          new SimpleCellWrapper(
            index,
            <RankCell name={neuronmatch2} weight={weight} reverse={weight2} color={typecolor} />,
            false,
            neuronmatch2
          )
        );
      }
    });

    if (rowcomps.length > 0) {
      if (rowcomps.length > maxcols) {
        maxcols = rowcomps.length;
      }
      formattable.push(rowcomps);
    }

    // load headers based on max number of columns
    headerdata.push(new SimpleCellWrapper(0, 'neuron'));
    for (let i = 1; i < maxcols; i++) {
      headerdata.push(new SimpleCellWrapper(i, '#' + String(i)));
    }

    return tables;
  }

  constructor(props) {
    super(props);
    var initqsParams = {
      neuronsrc: '',
      preorpost: 'pre'
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
        queryStr: '/npexplorer/rankedtable',
        params: params,
        callback: RankedTable.parseResults,
        state: {
          preOrPost: this.state.qsParams.preorpost,
          neuronSrc: this.state.qsParams.neuronsrc
        }
      };

      this.props.callback(query);
    }
  };

  addNeuron = event => {
    var oldparams = this.state.qsParams;
    oldparams.neuronsrc = event.target.value;
    this.props.setURLQs(SaveQueryString('Query:' + this.constructor.queryName, oldparams));
    this.setState({ qsParams: oldparams });
  };

  setDirection = event => {
    var oldparams = this.state.qsParams;
    oldparams.preorpost = event.target.value;
    this.props.setURLQs(SaveQueryString('Query:' + this.constructor.queryName, oldparams));
    this.setState({ qsParams: oldparams });
  };

  render() {
    const { classes } = this.props;
    return (
      <div>
        <FormControl className={classes.formControl}>
          <NeuronHelp>
            <TextField
              label="Neuron name"
              multiline
              rows={1}
              value={this.state.qsParams.neuronsrc}
              rowsMax={4}
              className={classes.textField}
              onChange={this.addNeuron}
            />
          </NeuronHelp>
        </FormControl>
        <FormControl component="fieldset" required className={classes.formControl}>
          <FormLabel component="legend">Neuron Direction</FormLabel>
          <RadioGroup
            aria-label="preorpost"
            name="preorpost"
            className={classes.group}
            value={this.state.qsParams.preorpost}
            onChange={this.setDirection}
          >
            <FormControlLabel value="pre" control={<Radio />} label="Pre-synaptic" />
            <FormControlLabel value="post" control={<Radio />} label="Post-synaptic" />
          </RadioGroup>
        </FormControl>
        <Button variant="contained" onClick={this.processRequest}>
          Submit
        </Button>
      </div>
    );
  }
}

RankedTable.propTypes = {
  callback: PropTypes.func.isRequired,
  disable: PropTypes.bool,
  setURLQs: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired,
  datasetstr: PropTypes.string.isRequired,
  urlQueryString: PropTypes.string.isRequired
};

var RankedTableState = function(state) {
  return {
    urlQueryString: state.app.get('urlQueryString')
  };
};

var RankedTableDispatch = function(dispatch) {
  return {
    setURLQs: function(querystring) {
      dispatch(setUrlQS(querystring));
    }
  };
};

export default withStyles(styles)(
  connect(
    RankedTableState,
    RankedTableDispatch
  )(RankedTable)
);
