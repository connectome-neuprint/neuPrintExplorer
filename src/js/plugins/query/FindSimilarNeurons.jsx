/*
 * Find similar neurons in a dataset.
 */

import React from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';

import { ColorLegend } from 'plugins/MiniRoiHeatMap';
import {
  setColumnIndices,
  createSimpleConnectionQueryObject,
  generateRoiHeatMapAndBarGraph,
  getBodyIdForTable
} from './shared/pluginhelpers';
import NeuronStatusFilter from "./shared/NeuronStatusFilter";

const styles = theme => ({
  formControl: {
    marginBottom: theme.spacing(3)
  },
  radioGroup: {
    marginBottom: theme.spacing(3)
  },
  textField: {
    margin: 4,
    display: 'block',
    marginLeft: 'auto',
    marginRight: 'auto'
  },
  select: {
    fontFamily: theme.typography.fontFamily,
    margin: '0.5em 0 1em 0'
  },
  button: {
    margin: 4,
    display: 'block'
  },
  noBodyError: {
    fontSize: '0.9em'
  },
  clickable: {
    cursor: 'pointer'
  }
});

const pluginName = 'FindSimilarNeurons';
const pluginAbbrev = 'fsn';

function createVector(roiMap, roiOrder) {
  const numROIs = Object.keys(roiOrder).length;
  const vector = new Array(numROIs * 2).fill(0);
  Object.keys(roiMap).forEach(roi => {
    let roiSym = roi.replace('(R)', '');
    roiSym = roiSym.replace('(L)', '');
    if (roiSym !== roi) {
      roiSym += '-sym';
    }
    // only add ROIs in the list
    if (roiSym in roiOrder) {
      const prespot = roiOrder[roiSym];
      const postspot = roiOrder[roiSym] + numROIs;

      // hack to normalize pre to post by 5
      // TODO: get number of actual output connections
      const preval = roiMap[roi].pre || 0;
      vector[prespot] += preval * 5;
      vector[postspot] += roiMap[roi].post || 0;
    }
  });

  // normalize data by apply sigmoid (should probably
  // base this on information from the calling function,
  // current threshold is a hack
  for (let i = 0; i < vector.length; i+=1) {
    vector[i] = 1 / (1 + Math.exp(-((vector[i] - 150) / 40)));
  }

  return vector;
}

function computeDistance(vec1, vec2) {
  let score = 0;
  for (let i = 0; i < vec1.length; i+=1) {
    score += (vec1[i] - vec2[i]) ** 2;
  }
  return score;
}

function processNblastResults(query, apiResponse, actions, submit) {

  const { pm: parameters } = query;
  const columns = [
    'bodyId',
    'instance',
    'type',
    'nblast score',
    'pre',
    'post',
    'notes',
    'brain region breakdown',
    'brain region heatmap'
  ];

  const data = apiResponse.data.map(row => {
    const bodyId = row[0];
    const roiInfoObject = row[4];
    const totalPre = row[6];
    const totalPost = row[7];
    const { heatMap, barGraph } = generateRoiHeatMapAndBarGraph(
        roiInfoObject,
        parameters.superROIs,
        totalPre,
        totalPost
      );
    const postQuery = createSimpleConnectionQueryObject({
      dataSet: parameters.dataset,
      isPost: true,
      queryId: bodyId
    });
    const preQuery = createSimpleConnectionQueryObject({
      dataSet: parameters.dataset,
      queryId: bodyId
    });



    return [
      getBodyIdForTable(query.pm.dataset, bodyId, actions),
      row[1], // instance
      row[2], // type
      row[3], // nblast score
      {
        value: totalPre,
        action: () => submit(preQuery)
      },
      {
        value: totalPost,
        action: () => submit(postQuery)
      },
      row[5], // notes
      barGraph,
      heatMap
    ];
  });

  const title = `Neurons similar to ${parameters.bodyId} (NBLAST)`;
  return {
    columns,
    data,
    debug: apiResponse.debug,
    title
  };

}

function processSimilarResults(query, apiResponse, actions, submit) {
  const { pm: parameters } = query;

  // create vector array (to be used for inputs and outputs)
  const roiOrder = {};
  let spot = 0;
  for (let i = 0; i < parameters.superROIs.length; i+=1) {
    const roi = parameters.superROIs[i];
    let roiSym = roi.replace('(R)', '');
    roiSym = roiSym.replace('(L)', '');
    if (roiSym !== roi) {
      roiSym += '-sym';
    }
    if (!(roiSym in roiOrder)) {
      roiOrder[roiSym] = spot;
      spot+=1;
    }
  }
  roiOrder.None = spot;

  // create default array
  const defaultVector = createVector(parameters.roiMapBase, roiOrder);

  const basicColumns = [
    'bodyId',
    'instance',
    'notes',
    'type',
    'cropped',
    'pre',
    'post',
    'roiBarGraph',
    'roiHeatMap'
  ];
  // column instances
  const columns = [];
  // set basic columns
  const indexOf = setColumnIndices([...basicColumns, 'totalSimScore']);
  columns[indexOf.totalSimScore] = 'total similarity score';

  columns[indexOf.bodyId] = 'bodyId';
  columns[indexOf.instance] = 'instance';
  columns[indexOf.notes] = 'notes';
  columns[indexOf.type] = 'type';
  columns[indexOf.cropped] = 'is cropped';
  columns[indexOf.pre] = 'pre';
  columns[indexOf.post] = 'post';
  columns[indexOf.roiBarGraph] = 'brain region breakdown (mouseover for details)';
  columns[indexOf.roiHeatMap] = (
    <div>
      brain region heatmap (mouseover for details) <ColorLegend />
    </div>
  );
  columns[indexOf.subLevelRoiHeatMap] = 'sub-level roi heatmap';

  const data = apiResponse.data.map((row) => {
    const bodyId = row[0];
    const instance = row[1];
    const notes = row[7] || '';
    const type = row[2];
    const iscropped = row[3];
    const totalPre = row[4];
    const totalPost = row[5];
    const roiInfoObject = row[6];

    const converted = [];
    converted[indexOf.bodyId] = getBodyIdForTable(query.pm.dataset, bodyId, actions);
    converted[indexOf.instance] = instance;
    converted[indexOf.notes] = notes;
    converted[indexOf.type] = type;
    converted[indexOf.cropped] = iscropped;
    const postQuery = createSimpleConnectionQueryObject({
      dataSet: parameters.dataset,
      isPost: true,
      queryId: bodyId
    });
    converted[indexOf.post] = {
      value: totalPost,
      action: () => submit(postQuery)
    };

    const preQuery = createSimpleConnectionQueryObject({
      dataSet: parameters.dataset,
      queryId: bodyId
    });
    converted[indexOf.pre] = {
      value: totalPre,
      action: () => submit(preQuery)
    };
    converted[indexOf.roiBarGraph] = ''; // empty unless roiInfoObject present
    converted[indexOf.roiHeatMap] = '';
    converted[indexOf.totalSimScore] = 0;

    // compute sim score from base
    const currVector = createVector(roiInfoObject, roiOrder);
    converted[indexOf.totalSimScore] = computeDistance(defaultVector, currVector);

    if (roiInfoObject) {
      const { heatMap, barGraph } = generateRoiHeatMapAndBarGraph(
        roiInfoObject,
        parameters.superROIs,
        totalPre,
        totalPost
      );
      converted[indexOf.roiHeatMap] = heatMap;
      converted[indexOf.roiBarGraph] = barGraph;
    }

    return converted;
  });

  // sort by total similarity score; queried body id will be 0 so should be at top
  data.sort((a, b) => {
    if (a[indexOf.totalSimScore] < b[indexOf.totalSimScore]) return -1;
    if (a[indexOf.totalSimScore] > b[indexOf.totalSimScore]) return 1;
    return 0;
  });

  const title = `Neurons similar to ${parameters.bodyId}`;

  return {
    columns,
    data,
    debug: apiResponse.debug,
    title
  };
}

export class FindSimilarNeurons extends React.Component {
  static get details() {
    return {
      name: pluginName,
      displayName: 'Find similar neurons',
      abbr: pluginAbbrev,
      description:
        'Find neurons that are similar to a neuron of interest in terms of their input and output locations (Brain Regions).',
      visType: 'SimpleTable'
    };
  }

  static getColumnHeaders(query) {

    if (query?.pm?.algorithm === "nblast") {
      return [
        { name: 'bodyId', status: true },
        { name: 'instance', status: true },
        { name: 'type', status: true },
        { name: 'nblast score', status: true },
        { name: 'pre', status: true },
        { name: 'post', status: true },
        { name: 'notes', status: false },
        { name: 'brain region breakdown', status: true },
        { name: 'brain region heatmap', status: true },
      ];
    }

    const columnIds = [];

    columnIds.push(
      { name: 'bodyId', status: true },
      { name: 'instance', status: true },
      { name: 'notes', status: false },
      { name: 'type', status: true },
      { name: 'status', status: true },
      { name: 'pre', status: true },
      { name: 'post', status: true },
      { name: 'brain region breakdown', status: true },
      { name: 'brain region heatmap', status: true },
      { name: 'total similarity score', status: true }
    );

    return columnIds;
  }

  static fetchParameters() {
    return {};
  }

  static processResults({ query, apiResponse, actions, submitFunc }) {
    if (query?.pm?.algorithm === "nblast") {
      return processNblastResults(query, apiResponse, actions, submitFunc);
    }
    return processSimilarResults(query, apiResponse, actions, submitFunc);
  }

  constructor(props) {
    super(props);

    this.state = {
      bodyId: '',
      status: ['Traced'],
      errorMessage: '',
      algorithm: 'synapse',
      nBlastMatches: false
    };
  }

  componentDidMount() {
    this.updateNBlastStatus();
  }

  componentDidUpdate() {
    this.updateNBlastStatus();
  }


  loadNeuronFilters = params => {
    this.setState({
      status: params.status,
    });
  };


  submitROIQuery = roiInfo => {
    const { dataSet, superROIs, submit } = this.props;
    const { bodyId, status, algorithm } = this.state;

    const superROIsSet = new Set(superROIs);

    let totalin = 0;
    let totalout = 0;
    const roi2countIn = {};
    const roi2countOut = {};

    // create symmetry table -- hard coded to only work with (L) (R) names
    const key2roi = {};
    for (let i = 0; i < superROIs.length; i+=1) {
      const roi = superROIs[i];
      let roiSym = roi.replace('(R)', '');
      roiSym = roiSym.replace('(L)', '');
      if (roi !== roiSym) {
        roiSym += '-sym';
      }
      if (!(roiSym in key2roi)) {
        key2roi[roiSym] = [];
      }
      key2roi[roiSym].push(roi);
    }

    const roiMap = roiInfo[0][0];
    Object.keys(roiMap).forEach(roi => {
      if (superROIsSet.has(roi)) {
        let roiSym = roi.replace('(R)', '');
        roiSym = roiSym.replace('(L)', '');
        if (roi !== roiSym) {
          roiSym += '-sym';
        }

        if (!(roiSym in roi2countIn)) {
          roi2countIn[roiSym] = 0;
        }
        roi2countIn[roiSym] += roiMap[roi].post || 0;
        totalin += roiMap[roi].post || 0;

        if (!(roiSym in roi2countOut)) {
          roi2countOut[roiSym] = 0;
        }
        roi2countOut[roiSym] += roiMap[roi].pre || 0;
        totalout += roiMap[roi].pre || 0;
      }
    });

    // get the biggest rois to restrict the search
    const roisIn = Object.keys(roi2countIn);
    roisIn.sort((a, b) => roi2countIn[b] - roi2countIn[a]);

    const roisOut = Object.keys(roi2countIn);
    roisOut.sort((a, b) => roi2countOut[b] - roi2countOut[a]);

    const bigrois = new Set();

    let count = 0;
    // restrict to the biggest rois (to make the query faster and eliminate obvious no matches
    let thres = 0.7 * totalin;
    for (let i = 0; i < roisIn.length; i += 1) {
      count += roi2countIn[roisIn[i]];
      bigrois.add(roisIn[i]);
      if (count >= thres) {
        break;
      }
    }
    count = 0;
    // restrict to the biggest rois (to make the query faster and eliminate obvious no matches
    thres = 0.7 * totalout;
    for (let i = 0; i < roisOut.length; i += 1) {
      count += roi2countOut[roisOut[i]];
      bigrois.add(roisOut[i]);
      if (count >= thres) {
        break;
      }
    }

    let ROIwhere = '';

    if (status && status.length > 0) {
      ROIwhere = `WHERE n.status IN [${status.map(statusX => `"${statusX}"`).join(", ")}]`;
    }

    const bigroiArr = Array.from(bigrois);
    for (let i = 0; i < bigroiArr.length; i+=1) {
      const roi = bigroiArr[i];
      if (ROIwhere === '') {
        ROIwhere = 'WHERE ';
      } else {
        ROIwhere += ' AND ';
      }

      if (key2roi[roi].length === 2) {
        ROIwhere += `(n.\`${key2roi[roi][0]}\` OR n.\`${key2roi[roi][1]}\`)`;
      } else if (key2roi[roi].length === 1) {
        ROIwhere += `n.\`${key2roi[roi][0]}\``;
      }
    }

    let cypher = `
MATCH (n :Neuron) ${ROIwhere}
RETURN toString(n.bodyId) as \`n.bodyId\`, n.instance, n.type, n.cropped, n.pre, n.post, apoc.convert.fromJsonMap(n.roiInfo), n.notes`;

    if (algorithm === 'nblast') {
      cypher = `MATCH(n :hemibrain_Neuron)-[x :NblastMatchTo]->(m :hemibrain_Neuron)
WHERE x.score > 0.1 AND n.bodyId=${bodyId}
RETURN toString(m.bodyId) as \`m.bodyId\`, m.instance, m.type, x.score, apoc.convert.fromJsonMap(m.roiInfo), m.notes, m.pre, m.post
ORDER By x.score DESC`
    }

    const query = {
      dataSet,
      plugin: pluginName,
      pluginCode: pluginAbbrev,
      parameters: {
        cypherQuery: cypher,
        dataset: dataSet,
        superROIs,
        bodyId,
        roiMapBase: roiMap,
        algorithm
      },
      visProps: {
        rowsPerPage: 25
      }
    };

    submit(query);
  };

  // processing initial request
  processIDRequest = () => {
    const { dataSet } = this.props;
    const { bodyId } = this.state;

    const cypher = `MATCH (n :Neuron {bodyId: ${bodyId}}) RETURN apoc.convert.fromJsonMap(n.roiInfo) AS roiInfo`;

    const parameters = {
      cypher,
      dataset: dataSet
    };

    const queryUrl = '/api/custom/custom?np_explorer=find_similar_neurons';
    const querySettings = {
      headers: {
        'content-type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify(parameters),
      credentials: 'include',
      method: 'POST'
    };

    fetch(queryUrl, querySettings)
      .then(result => result.json())
      .then(resp => {
        if (resp.data.length !== 1) {
          this.setState({ errorMessage: `Error: body ${bodyId} not found` });
        } else {
          this.setState({ errorMessage: '' });
          this.submitROIQuery(resp.data);
        }
      })
      .catch(() => {
        this.setState({ errorMessage: 'Unknown error' });
      });
  };

  addNeuronBodyId = event => {
    this.setState({ bodyId: event.target.value });
  };

  handleAlgorithmChange = event => {
    this.setState({algorithm: event.target.value});
  };

  catchReturn = event => {
    // submit request if user presses enter
    if (event.keyCode === 13) {
      event.preventDefault();
      this.processIDRequest();
    }
  };

  updateNBlastStatus() {
    const { dataSet } = this.props;
    fetch('/api/custom/custom?np_explorer=find_similar_neurons', {
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        dataset: dataSet,
        cypher: 'MATCH (n:Meta) RETURN n.nBlastMatches'
      }),
      method: 'POST',
      credentials: 'include'
    }).then(result => {
      if (result.ok) {
        return result.json();
      }
      throw new Error(
        'Unable to fetch configuration, try reloading the page. If this error persists, please contact support.'
      );
    }).then(resp => {
      if (resp.data[0][0]) {
        this.setState({ nBlastMatches: true });
      }
    })
    .catch(() => {
      this.setState({ nBlastMatches: false });
    });
  }


  render() {
    const { classes, isQuerying, dataSet, actions, neoServerSettings } = this.props;
    const { bodyId, errorMessage, algorithm, nBlastMatches } = this.state;

    return (
      <div>
        <FormControl fullWidth className={classes.formControl}>
          <TextField
            label="Neuron ID"
            multiline
            fullWidth
            rows={1}
            value={bodyId}
            rowsMax={2}
            className={classes.textField}
            onChange={this.addNeuronBodyId}
            onKeyDown={this.catchReturn}
          />
        </FormControl>
        {nBlastMatches ? (
          <>
          <FormLabel component="legend">Search Algorithm</FormLabel>
        <RadioGroup
          aria-label="Type Of Algorithm"
          name="type"
          value={algorithm}
          className={classes.radioGroup}
          onChange={this.handleAlgorithmChange}
        >
          <FormControlLabel value="nblast" control={<Radio color="primary" />} label="NBLAST" />
          <FormControlLabel value="synapse" control={<Radio color="primary" />} label="Synapse Distribution" />
        </RadioGroup>
          </>
        ): ""}
        {algorithm === 'synapse' ? (
        <NeuronStatusFilter
          callback={this.loadNeuronFilters}
          datasetstr={dataSet}
          actions={actions}
          neoServer={neoServerSettings.get('neoServer')}
        />) : ""}

        <Button
          variant="contained"
          color="primary"
          className={classes.button}
          onClick={this.processIDRequest}
          disabled={!(bodyId.length > 0) || isQuerying}
        >
          Search By Body ID
        </Button>
        {errorMessage !== '' && (
          <Typography color="error" role="alert" className={classes.noBodyError}>
            {errorMessage}
          </Typography>
        )}
      </div>
    );
  }
}

FindSimilarNeurons.propTypes = {
  submit: PropTypes.func.isRequired,
  actions: PropTypes.object.isRequired,
  superROIs: PropTypes.arrayOf(PropTypes.string).isRequired,
  dataSet: PropTypes.string.isRequired,
  classes: PropTypes.object.isRequired,
  neoServerSettings: PropTypes.object.isRequired,
  isQuerying: PropTypes.bool.isRequired
};

export default withStyles(styles, { withTheme: true })(FindSimilarNeurons);
