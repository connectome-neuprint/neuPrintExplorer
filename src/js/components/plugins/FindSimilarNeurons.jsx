/*
 * Find similar neurons in a dataset.
*/

// TODO: create larger groups by merging similar groups

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import randomColor from 'randomcolor';

import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import TextField from '@material-ui/core/TextField';

import { submit, pluginResponseError } from 'actions/plugins';
import { setUrlQS } from '../../actions/app';
import RoiHeatMap, { ColorLegend } from '../visualization/MiniRoiHeatMap.react';
import RoiBarGraph from '../visualization/MiniRoiBarGraph.react';
import NeuronFilter from '../NeuronFilter.react';
import { LoadQueryString, SaveQueryString } from '../../helpers/qsparser';
import { getQueryString } from 'helpers/queryString';
import * as math from 'mathjs';

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

const pluginName = 'FindSimilarNeurons';
class FindSimilarNeurons extends React.Component {
  constructor(props) {
    super(props);
    const initqsParams = {
      typeValue: 'input',
      bodyId: '',
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

  static get queryName() {
    return 'Find similar neurons';
  }

  static get queryDescription() {
    return 'Find neurons that are similar to a neuron of interest in terms of their input and output locations (ROIs).';
  }

  // functions for processing results
  processResults = (query, apiResponse) => {
    const { actions } = this.props;
    const { parameters } = query;

    if (!query.parameters.getGroupsBoolean) {
      if (!(apiResponse.data.length > 0)) {
        // if no data produce appropriate error
        actions.pluginResponseError(parameters.emptyDataErrorMessage);
      }
      // store the index of the queried body id
      let queriedBodyIdIndex = 'none';

      // store super-level rois
      let roiList = apiResponse.data[0][6];
      roiList.push('none');
      const numberOfRois = roiList.length;

      // store sub-level rois
      let subLevelRois = new Set();

      let data = apiResponse.data.map((row, index) => {
        const bodyId = row[0];
        const name = row[1];
        const status = row[2];
        const totalPre = row[3];
        const totalPost = row[4];
        const roiInfo = row[5];

        // get index of queried body id so can move this data to top of table
        if (bodyId === parseInt(parameters.bodyId)) {
          queriedBodyIdIndex = index;
        }

        const converted = [
          bodyId,
          name,
          status,
          totalPre,
          totalPost,
          '', // empty unless roiInfoObject present
          ''
        ];

        const roiInfoObject = JSON.parse(roiInfo);

        if (roiInfoObject) {
          // calculate # pre and post in super rois (which are disjoint) to get total
          // number of synapses assigned to an roi
          let postInSuperRois = 0;
          let preInSuperRois = 0;
          // generate vector for sorting by similarity; fill with zeros
          const vector = Array(numberOfRois * 2).fill(0);
          Object.keys(roiInfoObject).forEach(roi => {
            const roiIndex = roiList.indexOf(roi);
            if (roiIndex !== -1) {
              preInSuperRois += roiInfoObject[roi]['pre'];
              postInSuperRois += roiInfoObject[roi]['post'];
              vector[roiIndex] = (roiInfoObject[roi]['pre'] * 1.0) / totalPre;
              vector[roiIndex + numberOfRois] = (roiInfoObject[roi]['post'] * 1.0) / totalPost;
            } else {
              subLevelRois.add(roi);
            }
          });

          // add this after the other rois have been summed.
          // records # pre and post that are not in rois
          roiInfoObject['none'] = {
            pre: totalPre - preInSuperRois,
            post: totalPost - postInSuperRois
          };
          const noneIndex = roiList.indexOf('none');
          vector[noneIndex] = (roiInfoObject['none']['pre'] * 1.0) / totalPre;
          vector[noneIndex + numberOfRois] = (roiInfoObject['none']['post'] * 1.0) / totalPost;

          const barGraph = (
            <RoiBarGraph
              roiList={roiList}
              roiInfoObject={roiInfoObject}
              preTotal={totalPre}
              postTotal={totalPost}
            />
          );
          converted[5] = barGraph;

          const heatMap = (
            <RoiHeatMap
              roiList={roiList}
              roiInfoObject={roiInfoObject}
              preTotal={totalPre}
              postTotal={totalPost}
            />
          );
          converted[6] = heatMap;

          //store vector
          converted[7] = vector;
        }

        return converted;
      });

      // produce sub-level roi information if present
      if (subLevelRois.size > 0) {
        apiResponse.data.forEach((row, index) => {
          const roiInfo = row[5];
          const roiInfoObject = JSON.parse(roiInfo);
          const totalPre = row[3];
          const totalPost = row[4];
          const subLevelRoiList = Array.from(subLevelRois);

          // sub-level roi vector
          const subLevelRoiVector = Array(subLevelRoiList.length * 2).fill(0);
          Object.keys(roiInfoObject).forEach(roi => {
            const roiIndex = subLevelRoiList.indexOf(roi);
            if (roiIndex !== -1) {
              subLevelRoiVector[roiIndex] = (roiInfoObject[roi]['pre'] * 1.0) / totalPre;
              subLevelRoiVector[roiIndex + subLevelRoiList.length] =
                (roiInfoObject[roi]['post'] * 1.0) / totalPost;
            }
          });
          data[index][11] = subLevelRoiVector;

          // sub-level ROI heatmap
          data[index][10] = (
            <RoiHeatMap
              roiList={subLevelRoiList}
              roiInfoObject={roiInfoObject}
              preTotal={totalPre}
              postTotal={totalPost}
            />
          );
        });
      }

      let columns;
      if (queriedBodyIdIndex !== 'none') {
        // sort by similarity
        const queriedBodyVector = data[queriedBodyIdIndex][7];
        const queriedBodySubLevelVector = data[queriedBodyIdIndex][11];
        data.forEach(row => {
          const rawVector = row[7];
          // input score (pre)
          row[8] = math.round(
            math.sum(
              math.abs(
                math.subtract(queriedBodyVector.slice(numberOfRois), rawVector.slice(numberOfRois))
              )
            ) / 2.0,
            4
          );
          // output score (post)
          row[9] = math.round(
            math.sum(
              math.abs(
                math.subtract(
                  queriedBodyVector.slice(0, numberOfRois),
                  rawVector.slice(0, numberOfRois)
                )
              )
            ) / 2.0,
            4
          );
          // total score
          row[7] = math.round(
            math.sum(math.abs(math.subtract(queriedBodyVector, rawVector))) / 4.0,
            4
          );
          // sub-level rois
          if (subLevelRois.size > 0) {
            row[11] = math.round(
              math.sum(math.abs(math.subtract(queriedBodySubLevelVector, row[11]))) / 4.0,
              4
            );
            //incorporate sub-level rois into total score
            row[7] = (row[7] + row[11]) / 2.0;
          }
        });
        columns = [
          'bodyId',
          'name',
          'status',
          'pre',
          'post',
          'roi breakdown (mouseover for details)',
          <div>
            roi heatmap (mouseover for details) <ColorLegend />
          </div>,
          'total similiarity score',
          'input similiarity score',
          'output similiarity score'
        ];
        // add sub-level roi column headers if needed
        if (subLevelRois.size > 0) {
          columns[10] = 'sub-level rois';
          columns[11] = 'sub-level roi similarity score';
        }
      } else {
        data.forEach(row => {
          delete row[7];
        });
        columns = [
          'bodyId',
          'name',
          'status',
          'pre',
          'post',
          'roi breakdown (mouseover for details)',
          <div>
            roi heatmap (mouseover for details) <ColorLegend />
          </div>
        ];
      }

      // sort by total similarity score; queried body id will be 0 so should be at top
      data.sort((a, b) => {
        if (a[7] < b[7]) return -1;
        if (a[7] > b[7]) return 1;
        return 0;
      });

      return {
        columns: columns,
        data,
        debug: apiResponse.debug
      };
    } else {
      // for displaying cluster names
      const data = apiResponse.data.map(row => {
        const clusterName = row[0];

        const clusterQueryString =
          "MATCH (m:Meta{dataset:'" +
          parameters.dataset +
          "'}) WITH m.superLevelRois AS rois MATCH (n:`" +
          parameters.dataset +
          "-Neuron`{clusterName:'" +
          clusterName +
          "'}) RETURN n.bodyId, n.name, n.status, n.pre, n.post, n.roiInfo, rois";

        parameters.clusterName = clusterName;
        parameters.getGroupsBoolean = false;
        parameters.emptyDataErrorMessage = 'Cluster name does not exist in the dataset.';

        const title = 'Neurons with classification ' + clusterName;

        const clusterQuery = {
          dataSet: parameters.dataset,
          cypherQuery: clusterQueryString,
          visType: 'SimpleTable',
          plugin: pluginName,
          parameters: parameters,
          title: title,
          menuColor: randomColor({ luminosity: 'light', hue: 'random' }),
          processResults: this.processResults
        };

        const converted = [
          {
            value: clusterName,
            action: () => actions.submit(clusterQuery)
          }
        ];

        return converted;
      });

      return {
        columns: ['cluster name (click to explore group)'],
        data,
        debug: apiResponse.debug
      };
    }
  };

  // processing intital request
  processRequest = () => {
    const { dataSet, actions, history } = this.props;
    const { bodyId, getGroups } = this.state.qsParams;
    const getGroupsBoolean = getGroups === 'true' ? true : false;

    const parameters = {
      dataset: dataSet,
      getGroupsBoolean: getGroupsBoolean
    };

    if (!getGroupsBoolean) {
      parameters.bodyId = bodyId;
      parameters.emptyDataErrorMessage = 'Body ID not found in the dataset.';
    } else {
      parameters.emptyDataErrorMessage = 'No cluster names found in the dataset.';
    }

    const similarQuery =
      "MATCH (m:Meta{dataset:'" +
      dataSet +
      "'}) WITH m.superLevelRois AS rois MATCH (n:`" +
      dataSet +
      '-Neuron`{bodyId:' +
      bodyId +
      '}) WITH n.clusterName AS cn, rois MATCH (n:`' +
      dataSet +
      '-Neuron`{clusterName:cn}) RETURN n.bodyId, n.name, n.status, n.pre, n.post, n.roiInfo, rois, n.clusterName';

    const groupsQuery = 'MATCH (n:`' + dataSet + '-Neuron`) RETURN DISTINCT n.clusterName';

    const queryStr = getGroupsBoolean ? groupsQuery : similarQuery;

    // TODO: change title based on results
    const title = getGroupsBoolean
      ? 'Cluster names for ' + dataSet + ' dataset'
      : 'Neurons similar to ' + bodyId;

    const query = {
      dataSet,
      cypherQuery: queryStr,
      visType: 'SimpleTable',
      plugin: pluginName,
      parameters,
      title: title,
      menuColor: randomColor({ luminosity: 'light', hue: 'random' }),
      processResults: this.processResults
    };

    actions.submit(query);

    history.push({
      pathname: '/results',
      search: getQueryString()
    });
  };

  loadNeuronFilters = params => {
    this.setState({
      limitBig: params.limitBig,
      statusFilters: params.statusFilters
    });
  };

  addNeuronBodyId = event => {
    const oldParams = this.state.qsParams;
    oldParams.bodyId = event.target.value;
    this.props.actions.setURLQs(SaveQueryString('Query:' + this.constructor.queryName, oldParams));
    this.setState({
      qsParams: oldParams
    });
  };

  addNeuronNames = event => {
    const oldParams = this.state.qsParams;
    oldParams.names = event.target.value;
    this.props.actions.setURLQs(SaveQueryString('Query:' + this.constructor.queryName, oldParams));
    this.setState({
      qsParams: oldParams
    });
  };

  setInputOrOutput = event => {
    const oldParams = this.state.qsParams;
    oldParams.typeValue = event.target.value;
    this.props.actions.setURLQs(SaveQueryString('Query:' + this.constructor.queryName, oldParams));
    this.setState({
      qsParams: oldParams
    });
  };

  getGroups = event => {
    const oldParams = this.state.qsParams;
    oldParams.getGroups = event.target.checked === true ? 'true' : false;
    this.props.actions.setURLQs(SaveQueryString('Query:' + this.constructor.queryName, oldParams));
    this.setState({
      qsParams: oldParams
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
    const { classes } = this.props;
    const getGroupsBoolean = this.state.qsParams.getGroups === 'true' ? true : false;
    return (
      <div>
        <FormControl className={classes.formControl}>
          <TextField
            label="Neuron bodyId"
            multiline
            fullWidth
            rows={1}
            value={this.state.qsParams.bodyId}
            disabled={getGroupsBoolean}
            rowsMax={4}
            className={classes.textField}
            onChange={this.addNeuronBodyId}
            onKeyDown={this.catchReturn}
          />
        </FormControl>
        <FormControlLabel
          control={
            <Checkbox checked={getGroupsBoolean} onChange={this.getGroups} value="getGroups" />
          }
          label="Explore groups (provides a list of cluster names; click cluster names to view neuron body ids in that cluster)"
        />
        <NeuronFilter callback={this.loadNeuronFilters} datasetstr={this.props.datasetstr} />
        <Button
          variant="contained"
          color="primary"
          onClick={this.processRequest}
          disabled={!(getGroupsBoolean || this.state.qsParams.bodyId.length > 0)}
        >
          Submit
        </Button>
      </div>
    );
  }
}

FindSimilarNeurons.propTypes = {
  actions: PropTypes.object.isRequired,
  availableROIs: PropTypes.array.isRequired,
  dataSet: PropTypes.string.isRequired,
  urlQueryString: PropTypes.string.isRequired,
  classes: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  isQuerying: PropTypes.bool.isRequired
};

const FindSimilarNeuronsState = function(state) {
  return {
    urlQueryString: state.app.get('urlQueryString'),
    isQuerying: state.query.isQuerying
  };
};

const FindSimilarNeuronsDispatch = dispatch => ({
  actions: {
    submit: query => {
      dispatch(submit(query));
    },
    setURLQs: function(querystring) {
      dispatch(setUrlQS(querystring));
    },
    pluginResponseError: error => {
      dispatch(pluginResponseError(error));
    }
  }
});

export default withRouter(
  withStyles(styles, { withTheme: true })(
    connect(
      FindSimilarNeuronsState,
      FindSimilarNeuronsDispatch
    )(FindSimilarNeurons)
  )
);
