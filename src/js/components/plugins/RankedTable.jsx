/*
 * Implements table view that shows ordered strongest connection to each neuron
 * and visually indicates the different classes of neurons.  (This is meant
 * to be similar to Lou's tables.)
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import randomColor from 'randomcolor';

import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import { withStyles } from '@material-ui/core/styles';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormLabel from '@material-ui/core/FormLabel';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Typography from '@material-ui/core/Typography';

import { submit, formError } from 'actions/plugins';
import { getQueryString } from 'helpers/queryString';
import ColorBox from '../visualization/ColorBox';
import NeuronHelp from '../NeuronHelp';

const styles = () => ({
  textField: {},
  formControl: {
    margin: '0.5em 0 1em 0',
    width: '100%'
  }
});

// available colors

/* const colorArray = [
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
]; */

const pluginName = 'RankedTable';

class RankedTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      neuronSrc: '',
      preOrPost: 'pre'
    };
  }

  static get queryName() {
    return 'Ranked Table';
  }

  static get queryDescription() {
    return 'Show connections to neuron(s) ranked in order and colored by neuron class';
  }

  static get isExperimental() {
    return true;
  }

  processResults = (query, apiResponse) => {
    const { dataSet } = query;

    const colorMap = {};
    const reverseCounts = {};

    const data = [];
    let lastBody = -1;
    let columns = [];
    let maxColumns = 0;

    apiResponse.data.forEach(row => {
      const [, , weight, body2, , , mId, nId, preId, body1] = row;

      if (
        (query.parameters.find_inputs === false && (preId !== mId || nId === mId)) ||
        (query.parameters.find_inputs === true && preId === mId)
      ) {
        if (body2 in reverseCounts) {
          reverseCounts[String(body2)][String(body1)] = weight;
        } else {
          reverseCounts[String(body2)] = {};
          reverseCounts[String(body2)][String(body1)] = weight;
        }
      }
    });

    apiResponse.data.forEach((row, index) => {
      const [neuron1, neuron2, weight, body2, , neuron2Type, mId, nId, preId, body1] = row;

      if (
        (query.parameters.find_inputs === false && preId === mId) ||
        (query.parameters.find_inputs === true && (preId !== mId || nId === mId))
      ) {
        // check the colormap for the current type.
        // if present use the existing color.
        // else add a new one from the list. Unless they have all been used,
        // then add a random one.
        if (!(neuron2Type in colorMap)) {
          colorMap[neuron2Type] = randomColor({ luminosity: 'light', hue: 'random' });
        }
        // color should be white if we don't have a type defined.
        const weightColor = neuron2Type ? colorMap[neuron2Type] : '#ffffff';

        // start a new row for each body1.
        if (body1 !== lastBody) {
          data.push(columns);
          maxColumns = Math.max(columns.length, maxColumns);
          columns = [`${neuron1 || body1} (${body1})`];
        }

        let reverseWeight = 0;
        if (body2 in reverseCounts && body1 in reverseCounts[body2]) {
          reverseWeight = reverseCounts[body2][body1];
        }

        const cellKey = `${index}${body1}${body2}`;

        // add the current item to the current columns array
        columns.push({
          value: (
            <ColorBox
              margin={0}
              width={85}
              height={85}
              backgroundColor={weightColor}
              title=""
              key={cellKey}
              text={
                <div>
                  <Typography>{neuron2 || body2}</Typography>
                  <Typography variant="caption">{weight}</Typography>
                  <Typography variant="caption">{reverseWeight}</Typography>
                </div>
              }
            />
          ),
          uniqueId: cellKey
        });

        lastBody = body1;
      }
    });
    // make sure the last column is added.
    maxColumns = Math.max(columns.length, maxColumns);
    data.push(columns);

    const headings = Array(maxColumns - 1)
      .fill(0)
      .map((e, i) => `#${i + 1}`);

    return {
      columns: ['', ...headings],
      data,
      debug: apiResponse.debug,
      dataSet
    };
  };

  processRequest = () => {
    const { neuronSrc, preOrPost } = this.state;
    const { dataSet, actions, history } = this.props;
    if (neuronSrc !== '') {
      const parameters = { dataset: dataSet };
      if (/^\d+$/.test(neuronSrc)) {
        parameters.neuron_id = parseInt(neuronSrc, 10);
      } else {
        parameters.neuron_name = neuronSrc;
      }
      let title = `Outputs from ${neuronSrc}`;

      if (preOrPost === 'pre') {
        parameters.find_inputs = false;
      } else {
        parameters.find_inputs = true;
        title = `Inputs to ${neuronSrc}`;
      }

      const query = {
        dataSet,
        queryString: '/npexplorer/rankedtable',
        visType: 'HeatMapTable',
        visProps: { squareSize: 85 },
        plugin: pluginName,
        parameters,
        title,
        menuColor: randomColor({ luminosity: 'light', hue: 'random' }),
        processResults: this.processResults
      };

      actions.submit(query);
      history.push({
        pathname: '/results',
        search: getQueryString()
      });
    } else {
      actions.formError('Please enter a neuron name.');
    }
  };

  addNeuron = event => {
    this.setState({ neuronSrc: event.target.value });
  };

  setDirection = event => {
    this.setState({ preOrPost: event.target.value });
  };

  catchReturn = event => {
    // submit request if user presses enter
    if (event.keyCode === 13) {
      event.preventDefault();
      this.processRequest();
    }
  };

  render() {
    const { classes, isQuerying } = this.props;
    const { neuronSrc, preOrPost } = this.state;
    return (
      <div>
        <FormControl className={classes.formControl}>
          <NeuronHelp>
            <TextField
              label="Neuron name"
              multiline
              fullWidth
              rows={1}
              value={neuronSrc}
              rowsMax={4}
              className={classes.textField}
              onChange={this.addNeuron}
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
            value={preOrPost}
            onChange={this.setDirection}
          >
            <FormControlLabel
              value="pre"
              control={<Radio color="primary" />}
              label="Pre-synaptic"
            />
            <FormControlLabel
              value="post"
              control={<Radio color="primary" />}
              label="Post-synaptic"
            />
          </RadioGroup>
        </FormControl>
        <Button
          disabled={isQuerying}
          variant="contained"
          color="primary"
          onClick={this.processRequest}
        >
          Submit
        </Button>
      </div>
    );
  }
}

RankedTable.propTypes = {
  isQuerying: PropTypes.bool.isRequired,
  history: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
  dataSet: PropTypes.string.isRequired
};

const RankedTableState = state => ({
  isQuerying: state.query.isQuerying,
  urlQueryString: state.app.get('urlQueryString')
});

const RankedTableDispatch = dispatch => ({
  actions: {
    submit: query => {
      dispatch(submit(query));
    },
    formError: query => {
      dispatch(formError(query));
    }
  }
});

export default withRouter(
  withStyles(styles)(
    connect(
      RankedTableState,
      RankedTableDispatch
    )(RankedTable)
  )
);
