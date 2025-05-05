/*
 * Query form to load skeleton view with provided ids.
 */
import React from 'react';
import PropTypes from 'prop-types';

import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import { withStyles } from '@material-ui/core/styles';

const pluginName = 'Skeleton';
const pluginAbbrev = 'sk';

const styles = theme => ({
  formControl: {
    margin: theme.spacing(1)
  }
});

class Skeleton extends React.Component {
  static get details() {
    return {
      name: pluginName,
      displayName: pluginName,
      abbr: pluginAbbrev,
      download: false,
      category: 'visualization',
      description: 'Submit a list of neuron Ids to see their skeleton in 3D',
      visType: 'SkeletonView'
    };
  }

  static fetchParameters() {
    return {
      skip: true
    };
  }

  static processResults({ query }) {
    return {
      debug: 'No cypher query for this plugin',
      title: `Skeleton viewer for ${query.pm.dataset}`
    };
  }

  static download3DSeed = apiResponse => () => {
    const jsonDownload = {
      dataset: apiResponse.ds
    };
    if (apiResponse.pm.bodyIds) {
      jsonDownload.bodies = apiResponse.pm.bodyIds.toString().split(',');
    }
    if (apiResponse.pm.compartments) {
      jsonDownload.rois = apiResponse.pm.compartments.split(',');
    }

    const element = document.createElement('a');
    const file = new Blob([JSON.stringify(jsonDownload)], { type: 'application/json' });
    element.href = URL.createObjectURL(file);
    element.download = 'seed.json';
    document.body.appendChild(element);
    element.click();
    setTimeout(() => {
      document.body.removeChild(element);
      URL.revokeObjectURL(file);
    }, 100);
  };

  constructor(props) {
    super(props);
    this.state = {
      bodyIds: ''
    };
  }

  // creates query object and sends to callback
  processRequest = () => {
    const { dataSet, submit } = this.props;
    const { bodyIds } = this.state;
    const query = {
      dataSet,
      plugin: pluginName,
      pluginCode: pluginAbbrev,
      parameters: {
        dataset: dataSet,
        skip: true, // skip the data fetching in Requests.
        bodyIds
      }
    };
    submit(query);
  };

  addNeuronBodyIds = event => {
    this.setState({
      bodyIds: event.target.value
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
    const { isQuerying, classes } = this.props;
    const { bodyIds } = this.state;
    return (
      <div>
        <FormControl fullWidth className={classes.formControl}>
          <TextField
            label="Neuron IDs"
            multiline
            fullWidth
            rows={1}
            value={bodyIds}
            name="bodyIds"
            rowsMax={4}
            helperText="Separate IDs with commas."
            onChange={this.addNeuronBodyIds}
            onKeyDown={this.catchReturn}
          />
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

Skeleton.propTypes = {
  dataSet: PropTypes.string.isRequired,
  isQuerying: PropTypes.bool.isRequired,
  submit: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired
};

export default withStyles(styles, { withTheme: true })(Skeleton);
