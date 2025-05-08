/*
 * Query form to load neuroglancer view with provided ids.
*/
import React from 'react';
import PropTypes from 'prop-types';

import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import withStyles from '@mui/styles/withStyles';

const pluginName = 'Neuroglancer';
const pluginAbbrev = 'ng';

const styles = theme => ({
  formControl: {
    margin: theme.spacing(1)
  }
});


class Neuroglancer extends React.Component {
  static get details() {
    return {
      name: pluginName,
      displayName: pluginName,
      abbr: pluginAbbrev,
      download: false,
      category: 'visualization',
      description: 'Submit a list of neuron Ids to see them in the neuroglancer view.',
      visType: 'NeuroglancerView'
    };
  }

  static fetchParameters(params) {
    return {
      queryUrl: `/api/npexplorer/nglayers/${params.dataset}.json`,
      method: 'GET',
    };
  }

  static processResults({ query, apiResponse }) {
    return {
      debug: 'No cypher query for this plugin',
      data: apiResponse,
      title: `Neuroglancer viewer for ${query.pm.dataset}`,
    };
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
        bodyIds
      },
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
        <FormControl variant="standard" fullWidth className={classes.formControl}>
          <TextField
            variant="standard"
            label="Neuron IDs"
            multiline
            fullWidth
            rows={1}
            value={bodyIds}
            name="bodyIds"
            maxRows={4}
            helperText="Separate IDs with commas."
            onChange={this.addNeuronBodyIds}
            onKeyDown={this.catchReturn} />
        </FormControl>
        <Button disabled={isQuerying} variant="contained" color="primary" onClick={this.processRequest}>
          Submit
        </Button>
      </div>
    );
  }
}

Neuroglancer.propTypes = {
  dataSet: PropTypes.string.isRequired,
  isQuerying: PropTypes.bool.isRequired,
  submit: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles, { withTheme: true })(Neuroglancer);
