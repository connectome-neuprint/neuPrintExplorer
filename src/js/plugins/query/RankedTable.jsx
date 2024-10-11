/* eslint-disable camelcase */
/*
 * Implements table view that shows ordered strongest connection to each neuron
 * and visually indicates the different classes of neurons.  (This is meant
 * to be similar to Lou's tables.)
 */
import React from 'react';
import PropTypes from 'prop-types';
import randomColor from 'randomcolor';

import Button from '@material-ui/core/Button';
import { withStyles } from '@material-ui/core/styles';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Typography from '@material-ui/core/Typography';
import Icon from '@material-ui/core/Icon';
import Switch from '@material-ui/core/Switch';

import ColorBox from '@neuprint/colorbox';
import NeuronInputField from './shared/NeuronInputField';
import AdvancedNeuronInput from './shared/AdvancedNeuronInput';
import HPWeightSlider from './shared/HPWeightSlider';

const squareSize = 100;

const styles = () => ({
  textField: {},
  formControl: {
    margin: '0.5em 0 1em 0',
    width: '100%'
  }
});

const pluginName = 'RankedTable';
const pluginAbbrev = 'rt';

export class RankedTable extends React.Component {
  static get details() {
    return {
      name: pluginName,
      displayName: 'Ranked Table',
      abbr: pluginAbbrev,
      description: 'Show connections to neuron(s) ranked in order and colored by neuron class',
      visType: 'HeatMapTable'
    };
  }

  static fetchParameters() {
    return {
      queryString: '/npexplorer/rankedtable'
    };
  }

  static processResults({ query, apiResponse }) {
    const { dataSet } = query;
    const { useHighConfidence, find_inputs } = query.pm;

    const colorMap = {};
    const reverseCounts = {};

    const data = [];
    let lastBody = -1;
    let columns = [];
    let maxColumns = 0;

    // need to re-sort by weightHP (grouped by body1 id) if using high confidence
    if (useHighConfidence) {
      apiResponse.data.sort((a, b) => {
        const weightHPa = a[10];
        const weightHPb = b[10];
        const body1a = a[9];
        const body1b = b[9];

        if (body1a > body1b) {
          return 1;
        }
        if (body1a < body1b) {
          return -1;
        }
        if (body1a === body1b) {
          if (weightHPa > weightHPb) {
            return -1;
          }
          if (weightHPa < weightHPb) {
            return 1;
          }
        }
        return 0;
      });
    }

    apiResponse.data.forEach(row => {
      const [, , , , weight, body2, mId, nId, preId, body1, weightHP] = row;

      if (
        (find_inputs === false && (preId !== mId || nId === mId)) ||
        (find_inputs === true && preId === mId)
      ) {
        if (body2 in reverseCounts) {
          reverseCounts[String(body2)][String(body1)] = useHighConfidence ? weightHP : weight;
        } else {
          reverseCounts[String(body2)] = {};
          reverseCounts[String(body2)][String(body1)] = useHighConfidence ? weightHP : weight;
        }
      }
    });

    apiResponse.data.forEach((row, index) => {
      const [
        neuron1,
        ,
        neuron2,
        neuron2Type,
        weight,
        body2,
        mId,
        nId,
        preId,
        body1,
        weightHP
      ] = row;

      if (
        (find_inputs === false && preId === mId) ||
        (find_inputs === true && (preId !== mId || nId === mId))
      ) {
        // check the colormap for the current type.
        // if present use the existing color.
        // else add a new one from the list. Unless they have all been used,
        // then add a random one.
        if (neuron2Type && !(neuron2Type in colorMap)) {
          colorMap[neuron2Type] = randomColor({ luminosity: 'light', hue: 'random' });
        } else if (neuron2 && !(neuron2 in colorMap)) {
          colorMap[neuron2] = randomColor({ luminosity: 'light', hue: 'random' });
        }
        // color should be white if we don't have a type defined.
        let weightColor = '#ffffff';
        if (neuron2Type) {
          weightColor = colorMap[neuron2Type];
        } else if (neuron2) {
          weightColor = colorMap[neuron2];
        }

        // start a new row for each body1.
        if (body1 !== lastBody) {
          data.push(columns);
          maxColumns = Math.max(columns.length - 1, maxColumns);
          columns = [`${neuron1 || body1} (${body1})`];
        }

        let reverseWeight = 0;
        if (body2 in reverseCounts && body1 in reverseCounts[body2]) {
          reverseWeight = reverseCounts[body2][body1];
        }

        const cellKey = `${index}${body1}${body2}`;

        // set arrow icons
        const arrow1 = find_inputs ? (
          <Icon fontSize="inherit">arrow_downward</Icon>
        ) : (
          <Icon fontSize="inherit">arrow_upward</Icon>
        );
        const arrow2 = find_inputs ? (
          <Icon fontSize="inherit">arrow_upward</Icon>
        ) : (
          <Icon fontSize="inherit">arrow_downward</Icon>
        );

        // truncate name if necessary
        let displayName = neuron2 || body2;
        if (displayName && displayName.length > 20) {
          displayName = `${displayName.substring(0, 17)}...`;
        }

        // add the current item to the current columns array
        columns.push({
          value: (
            <ColorBox
              margin={0}
              width={squareSize}
              height={squareSize}
              backgroundColor={weightColor}
              title=""
              key={cellKey}
              text={
                <>
                  <Typography
                    style={{
                      marginTop: '20px',
                      marginLeft: '10px',
                      marginRight: '10px',
                      textAlign: 'center',
                      wordBreak: 'break-all'
                    }}
                    variant="body2"
                    title={neuron2 || body2}
                  >
                    {displayName}
                  </Typography>
                  <Typography
                    style={{
                      marginTop: '0px',
                      marginLeft: '10px',
                      marginRight: '10px',
                      textAlign: 'center',
                      wordBreak: 'break-all'
                    }}
                    variant="caption"
                  >
                    {body2}
                  </Typography>

                  <div
                    style={{
                      marginTop: 'auto',
                      display: 'flex'
                    }}
                  >
                    <Typography
                      style={{
                        display: 'flex',
                        alignItems: 'center'
                      }}
                      variant="caption"
                    >
                      {arrow1}
                      {useHighConfidence ? weightHP : weight}
                    </Typography>
                    <Typography
                      style={{
                        display: 'flex',
                        alignItems: 'center'
                      }}
                      variant="caption"
                    >
                      {arrow2}
                      {reverseWeight}
                    </Typography>
                  </div>
                </>
              }
            />
          ),
          uniqueId: cellKey
        });

        lastBody = body1;
      }
    });
    // make sure the last column is added.
    maxColumns = Math.max(columns.length - 1, maxColumns);
    data.push(columns);

    const headings = Array(maxColumns)
      .fill(0)
      .map((e, i) => `#${i + 1}`);

    const neuronSrc = query.pm.neuron_name || query.pm.neuron_id;
    let title = `Neurons postsynaptic to ${neuronSrc}`;

    if (query.pm.find_inputs) {
      title = `Neurons presynaptic to ${neuronSrc}`;
    }

    return {
      columns: ['', ...headings],
      data,
      debug: apiResponse.debug,
      dataSet,
      title
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      neuronSrc: '',
      preOrPost: 'pre',
      useHighConfidence: false,
      advancedSearch: false
    };
  }

  processRequest = () => {
    const { neuronSrc, preOrPost, useHighConfidence, advancedSearch } = this.state;
    const { dataSet, actions, submit } = this.props;
    if (neuronSrc !== '') {
      const parameters = { dataset: dataSet };
      if (/^\d+$/.test(neuronSrc)) {
        parameters.neuron_id = parseInt(neuronSrc, 10);
      } else {
        parameters.neuron_name = neuronSrc;
      }

      if (!advancedSearch) {
        parameters.enable_contains = true;
      }

      if (preOrPost === 'pre') {
        parameters.find_inputs = false;
      } else {
        parameters.find_inputs = true;
      }

      parameters.useHighConfidence = useHighConfidence;

      const query = {
        dataSet,
        visProps: { squareSize },
        plugin: pluginName,
        pluginCode: pluginAbbrev,
        parameters
      };

      submit(query);
    } else {
      actions.formError('Please enter a neuron name.');
    }
  };

  addNeuron = neuronSrc => {
    this.setState({ neuronSrc });
  };

  setDirection = event => {
    this.setState({ preOrPost: event.target.value });
  };

  toggleHighConfidence = () => {
    const { useHighConfidence } = this.state;
    this.setState({ useHighConfidence: !useHighConfidence });
  };

  toggleAdvanced = event => {
    this.setState({ advancedSearch: event.target.checked, neuronSrc: '' });
  };

  render() {
    const { classes, isQuerying, isPublic, dataSet } = this.props;
    const { neuronSrc, preOrPost, useHighConfidence, advancedSearch } = this.state;
    return (
      <div>
        {advancedSearch ? (
          <AdvancedNeuronInput
            onChange={this.addNeuron}
            value={neuronSrc}
            dataSet={dataSet}
            handleSubmit={this.processRequest}
          />
        ) : (
          <NeuronInputField
            onChange={this.addNeuron}
            value={neuronSrc}
            dataSet={dataSet}
            handleSubmit={this.processRequest}
          />
        )}
        <FormControl className={classes.formControl}>
          <FormControlLabel
            control={
              <Switch checked={advancedSearch} onChange={this.toggleAdvanced} color="primary" />
            }
            label={
              <Typography variant="subtitle1" style={{ display: 'inline-flex' }}>
                Advanced input
              </Typography>
            }
          />
        </FormControl>
        <FormControl component="fieldset" required className={classes.formControl}>
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
              label="Rank outputs"
            />
            <FormControlLabel
              value="post"
              control={<Radio color="primary" />}
              label="Rank inputs"
            />
          </RadioGroup>
        </FormControl>
        {isPublic ? (
          ''
        ) : (
          <HPWeightSlider
            formControlClass={classes.formControl}
            useHighConfidence={useHighConfidence}
            toggleHighConfidence={this.toggleHighConfidence}
          />
        )}
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
  submit: PropTypes.func.isRequired,
  actions: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
  dataSet: PropTypes.string.isRequired,
  isPublic: PropTypes.bool.isRequired
};

export default withStyles(styles)(RankedTable);
