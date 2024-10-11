/* eslint-disable prefer-destructuring */
import React from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select';

import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Tooltip from '@material-ui/core/Tooltip';

import IndependentTable from './visualization/IndependentTable';

const styles = theme => ({
  root: {},
  select: {
    fontFamily: theme.typography.fontFamily
  },
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: 200
  },
  tooltip: {
    color: 'red',
    verticalAlign: 'super',
    fontSize: '80%',
    marginLeft: theme.spacing(2)
  }
});

const highlightStats = (table, selected, filter) => {
  let totalconn = 0;
  let highconn = 0;
  let numbodies = 0;
  let numhigh = 0;
  for (let i = 0; i < table.length; i += 1) {
    if (table[i][3] <= filter) {
      break;
    }

    totalconn += table[i][3];
    numbodies += 1;
    if (i.toString() in selected) {
      highconn += table[i][3];
      numhigh += 1;
    }
  }

  return {
    totalconn,
    highconn,
    numbodies,
    numhigh
  };
};



class PartnerCompletenessView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      inputData: [],
      outputData: [],
      searchTarget: {
        bodyId: null,
        name: '',
        pre: 0,
        post: 0,
        status: ''
      },
      statusDefinitions: '',
      allStatus: []
    };
  }

  componentDidMount() {
    this.parseResults();
  }

  componentDidUpdate(prevProps) {
    const { query } = this.props;
    if (query !== prevProps.query) {
      this.parseResults();
    }
  }

  queryStatusDefinitions = (neoServer, dataset) => {
    const { actions } = this.props;
    if (neoServer === '') {
      return;
    }

    fetch('/api/custom/custom?np_explorer=partner_completeness_status_defs', {
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        dataset,
        cypher: `MATCH (n:Meta) RETURN n.statusDefinitions`
      }),
      method: 'POST',
      credentials: 'include'
    })
      .then(result => {
        if (result.ok) {
          return result.json();
        }
        throw new Error(
          'Unable to fetch status definitions, try reloading the page. If this error persists, please contact support.'
        );
      })
      .then(resp => {
        let statusDefinitions = '';
        if (resp.data[0][0]) {
          const statusDefinitionsObject = JSON.parse(resp.data[0][0].replace(/'/g, '"'));
          Object.keys(statusDefinitionsObject).forEach((status, index) => {
            statusDefinitions += `${status}: ${statusDefinitionsObject[status]}`;
            if (index < Object.keys(statusDefinitionsObject).length - 1) {
              statusDefinitions += ', ';
            }
          });
        }

        this.setState({ statusDefinitions });
      })
      .catch(error => {
        actions.metaInfoError(error);
      });
  };

  handleChange = event => {
    const { query, actions, index } = this.props;
    const { visProps = {} } = query;
    // only allow numbers or blank line
    const val = parseInt(event.target.value, 10) || '';
    if (/^\d+$/.test(val) || val === '') {
      const newVisProps = {...visProps, filter: val };
      const updated = {...query, visProps: newVisProps };
      delete updated.result;
      actions.updateQuery(index, updated);
    }
  };

  handleStatusChange = selected => {
    const { query, actions, index } = this.props;
    const { visProps = {} } = query;

    const val = selected.map(item => item.value).join(',');
    const newVisProps = {...visProps, status: val };
    const updated = {...query, visProps: newVisProps };
    delete updated.result;
    actions.updateQuery(index, updated);
  };

  parseResults() {
    const { query, neoServer } = this.props;
    const { pm: params, result } = query;

    this.queryStatusDefinitions(neoServer, params.dataset);

    const allStatus = new Set();
    const inputData = [];
    const outputData = [];
    const searchTarget = {
      bodyId: params.bodyId,
      name: result.data[0][8],
      pre: result.data[0][9],
      post: result.data[0][10],
      status: result.data[0][11]
    };

    const highlightIndexInput = {};
    const highlightIndexOutput = {};

    result.data.forEach(row => {
      const status = row[5];

      let highlight = false;

      if (status !== null && status !== '') {
        highlight = true;
        allStatus.add(status);
      }
      const tableData = [];
      for (let j = 0; j < 8; j += 1) {
        if (j !== 3) {
          tableData.push(row[j]);
        }
      }
      // check if is input or output
      if (row[3]) {
        if (highlight) {
          highlightIndexInput[inputData.length] = 'lightblue';
        }
        inputData.push(tableData);
      } else {
        if (highlight) {
          highlightIndexOutput[outputData.length] = 'lightblue';
        }
        outputData.push(tableData);
      }
    });

    this.setState({
      searchTarget,
      allStatus: [...allStatus],
      inputData,
      outputData
    });
  }

  render() {
    const { classes, query } = this.props;
    const { visProps = {} } = query;

    const { filter: orphanFilter = 0, status = '' } = visProps;
    // split the status string and filter out empty strings
    const selectedStatus = status.split(',').filter(x => x);
    const currSelectedSet = new Set(selectedStatus);

    const { inputData, outputData, searchTarget, statusDefinitions, allStatus } = this.state;

    const highlightIndexInput = {};
    const highlightIndexOutput = {};

    for (let i = 0; i < inputData.length; i += 1) {
      if (inputData[i][3] <= orphanFilter) {
        highlightIndexInput[i] = 'pink';
      } else if (currSelectedSet.has(inputData[i][4])) {
        highlightIndexInput[i] = 'lightblue';
      }
    }

    for (let i = 0; i < outputData.length; i += 1) {
      if (outputData[i][3] <= orphanFilter) {
        highlightIndexOutput[i] = 'pink';
      } else if (currSelectedSet.has(outputData[i][4])) {
        highlightIndexOutput[i] = 'lightblue';
      }
    }

    const inputStats = highlightStats(inputData, highlightIndexInput, orphanFilter);
    const inputPercent = ((inputStats.highconn / inputStats.totalconn) * 100 || 0).toFixed(2);
    const outputStats = highlightStats(outputData, highlightIndexOutput, orphanFilter);
    const outputPercent = ((outputStats.highconn / outputStats.totalconn) * 100 || 0).toFixed(2);

    const options = allStatus.map(name => ({
      label: name,
      value: name
    }));
    const currSelected = selectedStatus.map(name => ({
      label: name,
      value: name
    }));

    const tableColumns = ['id', 'instance', 'type', '#connections', 'status', '#pre', '#post'];

    return (
      <div className={classes.root}>
        <Typography variant="h6">Neuron information</Typography>
        <Typography>Name: {searchTarget.name}</Typography>
        <Typography>Status: {searchTarget.status}</Typography>
        <Typography>
          #pre: {searchTarget.pre}, #post: {searchTarget.post}
        </Typography>
        <div style={{ marginTop: '8px', marginBottom: '8px' }}>
          <Typography variant="subtitle1" style={{ display: 'inline-flex' }}>
            Desired level of completeness
            <Tooltip id="tooltip-icon" title={statusDefinitions || ''} placement="right">
              <div className={classes.tooltip}>?</div>
            </Tooltip>
          </Typography>
          <Select
            className={classes.select}
            isMulti
            value={currSelected}
            onChange={this.handleStatusChange}
            options={options}
            closeMenuOnSelect={false}
          />
        </div>
        <TextField
          id="orphanfilter"
          label="Filter (ignore #conn <=)"
          className={classes.textField}
          value={orphanFilter}
          onChange={this.handleChange}
          margin="normal"
        />
        <Typography variant="h6">Inputs</Typography>
        <Typography>
          {inputPercent} percent connections,{' '}
          {inputStats.numhigh} bodies highlighted out of {inputStats.numbodies}
        </Typography>
        <IndependentTable
          data={inputData}
          columns={tableColumns}
          rowsPerPage={10}
          disableSort={new Set([0, 1, 2, 3, 4, 5])}
          highlightIndex={highlightIndexInput}
        />
        <Typography variant="h6">Outputs</Typography>
        <Typography>
          {outputPercent} percent connections,{' '}
          {outputStats.numhigh} bodies highlighted out of {outputStats.numbodies}
        </Typography>
        <IndependentTable
          data={outputData}
          columns={tableColumns}
          rowsPerPage={10}
          disableSort={new Set([0, 1, 2, 3, 4, 5])}
          highlightIndex={highlightIndexOutput}
        />
      </div>
    );
  }
}

PartnerCompletenessView.propTypes = {
  query: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
  neoServer: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired
};

export default withStyles(styles)(PartnerCompletenessView);
