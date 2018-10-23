import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Select from 'react-select';
import { withRouter } from 'react-router';
import randomColor from 'randomcolor';

import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';

import { submit } from '../../actions/plugins';
import RoiHeatMap, { ColorLegend } from '../../components/visualization/MiniRoiHeatMap.react'
import RoiBarGraph from '../../components/visualization/MiniRoiBarGraph.react'

const styles = theme => ({
  select: {
    fontFamily: theme.typography.fontFamily,
    margin: '0.5em 0 1em 0'
  }
});

const pluginName = 'TestPlugin';

// this function will parse the results from the query to the
// Neo4j server and place them in the correct format for the
// visualization plugin.
function processResults(apiResponse) {

  const roiList = ['proximal','distal','none'];

  const data = apiResponse.data.map(row => {

    const roiInfoObject = JSON.parse(row[3]);

    const post = Object.values(roiInfoObject).reduce((total, current) => {
      return total + current.post;
    }, 0);

    const pre = Object.values(roiInfoObject).reduce((total, current) => {
      return total + current.pre;
    }, 0);

    // add this after the other rois have been summed.
    roiInfoObject['none'] = {
      pre: row[5] - pre,
      post: row[6] - post,
    };

    const heatMap = <RoiHeatMap roiList={roiList} roiInfoObject={roiInfoObject} preTotal={pre} postTotal={post} />;

    const barGraph = <RoiBarGraph roiList={roiList} roiInfoObject={roiInfoObject} preTotal={pre} postTotal={post} />;

    return [row[0], row[1], row[2], post, pre, row[4], heatMap, barGraph];
  });
  return {
    columns: [
      'id',
      'neuron',
      'status',
      '#post (inputs)',
      '#pre (outputs)',
      '#voxels',
      <div>roi heatmap <ColorLegend/></div>,
      'roi breakdown'
    ],
    data,
    debug: apiResponse.debug
  };
}

const selectOptions = [{ label: 'One', value: '1' }, { label: 'Two', value: '2' }];

class TestPlugin extends React.Component {
  state = {
    parameters: {
      select: selectOptions[0]
    }
  };

  static get queryName() {
    // This is the string used in the 'Query Type' select.
    return 'Test Plugin';
  }

  static get queryDescription() {
    // This is a description of the purpose of the plugin.
    // it will be displayed in the form above the custom
    // inputs for this plugin.
    return 'Generates simple table on submit.';
  }

  // use this method to cleanup your form data, perform validation
  // and generate the query object.
  processRequest = () => {
    const { dataSet, actions, history } = this.props;

    const parameters = Object.assign(
      {
        dataset: dataSet,
        pre_threshold: 2
      },
      this.state.parameters
    );

    const query = {
      dataSet, // <string> for the data set selected
      queryString: '/npexplorer/findneurons', // <neo4jquery string>
      // cypherQuery: <string> if this is passed then use generic /api/custom/custom endpoint
      visType: 'SimpleTable', // <string> which visualization plugin to use. Default is 'table'
      plugin: pluginName, // <string> the name of this plugin.
      parameters, // <object>
      title: `Neurons with inputs in [${Math.random()}] and outputs in [bar]`,
      menuColor: randomColor({ luminosity: 'light', hue: 'random' }),
      processResults
    };
    actions.submit(query);
    // redirect to the results page.
    history.push('/results');
  };

  handleChange = selected => {
    const currentParameters = this.state.parameters;
    const updatedParameters = Object.assign({}, currentParameters, { select: selected });
    this.setState({ parameters: updatedParameters });
  };

  // use this function to generate the form that will accept and
  // validate the variables for your Neo4j query.
  render() {
    const { classes } = this.props;
    const selectValue = this.state.parameters.select;
    return (
      <div>
        <Select
          className={classes.select}
          value={selectValue}
          onChange={this.handleChange}
          options={selectOptions}
          closeMenuOnSelect={true}
        />
        <Button color="primary" variant="contained" onClick={this.processRequest}>
          Submit
        </Button>
      </div>
    );
  }
}

// data that will be provided to your form. Use it to build
// inputs, selections and for validation.
TestPlugin.propTypes = {
  actions: PropTypes.object.isRequired,
  availableROIs: PropTypes.array.isRequired,
  dataSet: PropTypes.string.isRequired,
  classes: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired
};

var TestPluginState = function(state) {
  return {};
};

// The submit action which will accept your query, execute it and
// store the results for view plugins to display.
var TestPluginDispatch = dispatch => ({
  actions: {
    submit: query => {
      dispatch(submit(query));
    }
  }
});

// boiler plate for redux.
export default withRouter(
  withStyles(styles)(
    connect(
      TestPluginState,
      TestPluginDispatch
    )(TestPlugin)
  )
);
