/*
 * Supports simple, custom neo4j query.
*/
import React from 'react';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import PropTypes from 'prop-types';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormLabel from '@material-ui/core/FormLabel';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { withStyles } from '@material-ui/core/styles';
import { LoadQueryString, SaveQueryString } from '../../helpers/qsparser';
import { connect } from 'react-redux';
import NeuronHelp from '../NeuronHelp.react';
import SimpleCellWrapper from '../../helpers/SimpleCellWrapper';
import { setUrlQS } from '../../actions/app';

const styles = () => ({
  textField: {},
  formControl: {},
  badge: {
    right: '-10px',
    width: '100px',
    height: '50px',
    top: '-10px'
  }
});

class SimpleConnections extends React.Component {
  static get queryName() {
    return 'Simple Connections';
  }

  static get queryDescription() {
    return 'List inputs or outputs to provided neuron(s)';
  }

  static parseResults(neoResults, state) {
    // load one table from neoResults
    var tables = [];
    let index = 0;
    var headerdata = [
      new SimpleCellWrapper(index++, 'ID'),
      new SimpleCellWrapper(index++, 'Name'),
      new SimpleCellWrapper(index++, 'Weight')
    ];
    var currtable = [];
    var lastbody = -1;

    var lastname = '';
    // retrieve records
    neoResults.records.forEach(function(record) {
      var newval = record.get('Neuron1Id');
      if (lastbody !== -1 && newval !== lastbody) {
        var tabname = lastname + ' id=(' + String(lastbody) + ')';
        if (state.preOrPost === 'pre') {
          tabname = tabname + ' => ...';
        } else {
          tabname = '... => ' + tabname;
        }

        tables.push({
          header: headerdata,
          body: currtable,
          name: tabname
        });
        currtable = [];
      }
      lastbody = newval;
      lastname = record.get('Neuron1');

      let neuronname = record.get('Neuron2');
      if (neuronname === null) {
        neuronname = '';
      }
      currtable.push([
        new SimpleCellWrapper(index++, record.get('Neuron2Id')),
        new SimpleCellWrapper(index++, neuronname),
        new SimpleCellWrapper(index++, record.get('Weight'))
      ]);
    });

    if (lastbody !== -1) {
      var tabname = lastname + ' id=(' + String(lastbody) + ')';
      if (state.preOrPost === 'pre') {
        tabname = tabname + ' => ...';
      } else {
        tabname = '... => ' + tabname;
      }

      tables.push({
        header: headerdata,
        body: currtable,
        name: tabname
      });
    }

    return tables;
  }

  constructor(props) {
    super(props);
    var initqsParams = {
      neuronpre: '',
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
    if (this.state.qsParams.neuronpre !== '') {
      let params = { dataset: this.props.datasetstr };
      if (isNaN(this.state.qsParams.neuronpre)) {
        params['neuron_name'] = this.state.qsParams.neuronpre;
      } else {
        params['neuron_id'] = parseInt(this.state.qsParams.neuronpre);
      }
      if (this.state.qsParams.preorpost === 'pre') {
        params['find_inputs'] = false;
      } else {
        params['find_inputs'] = true;
      }
      let query = {
        queryStr: '/npexplorer/simpleconnections',
        params: params,
        callback: SimpleConnections.parseResults,
        state: {
          preOrPost: this.state.qsParams.preorpost
        }
      };

      this.props.callback(query);
    }
  };

  handleClick = event => {
    this.props.setURLQs(
      SaveQueryString('Query:' + this.constructor.queryName, { neuronpre: event.target.value })
    );
    this.setState({ qsParams: { neuronpre: event.target.value } });
  };

  setDirection = event => {
    var oldparams = this.state.qsParams;
    oldparams.preorpost = event.target.value;
    this.props.setURLQs(SaveQueryString('Query:' + this.constructor.queryName, oldparams));
    this.setState({ qsParams: oldparams });
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
      <div>
        <FormControl className={classes.formControl}>
          <NeuronHelp>
            <TextField
              label="Neuron name"
              multiline
              rows={1}
              value={this.state.qsParams.neuronpre}
              rowsMax={4}
              className={classes.textField}
              onChange={this.handleClick}
              onKeyDown={this.catchReturn}
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

SimpleConnections.propTypes = {
  callback: PropTypes.func.isRequired,
  disable: PropTypes.bool,
  setURLQs: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired,
  datasetstr: PropTypes.string.isRequired,
  urlQueryString: PropTypes.string.isRequired
};

var SimpleConnectionsState = function(state) {
  return {
    urlQueryString: state.app.get('urlQueryString')
  };
};

var SimpleConnectionsDispatch = function(dispatch) {
  return {
    setURLQs: function(querystring) {
      dispatch(setUrlQS(querystring));
    }
  };
};

export default withStyles(styles)(
  connect(
    SimpleConnectionsState,
    SimpleConnectionsDispatch
  )(SimpleConnections)
);
