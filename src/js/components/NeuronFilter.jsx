/*
 * Form to provide filters based on neuron properties.
 */

import React from 'react';
import PropTypes from 'prop-types';
import merge from 'deepmerge';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Typography from '@material-ui/core/Typography';
import Select from 'react-select';
import Tooltip from '@material-ui/core/Tooltip';
import TextField from '@material-ui/core/TextField';
import { setUrlQS, metaInfoError } from '../actions/app';
import { getQueryObject, setQueryString } from '../helpers/queryString';

const styles = theme => ({
  formControl: {
    margin: theme.spacing.unit,
    minWidth: 250,
    maxWidth: 350
  },
  expandablePanel: {
    margin: theme.spacing.unit
  },
  nopad: {
    padding: 0
  },
  select: {
    fontFamily: theme.typography.fontFamily,
    margin: 0,
    marginTop: theme.spacing.unit
  },
  textField: {
    maxWidth: 230,
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit
  },
  tooltip: {
    color: 'red',
    verticalAlign: 'super',
    fontSize: '80%',
    marginLeft: theme.spacing.unit / 2
  }
});

class NeuronFilter extends React.Component {
  constructor(props) {
    super(props);

    const initParams = {
      limitNeurons: true,
      statusFilters: [],
      preThreshold: '',
      postThreshold: ''
    };

    const qsParams = getQueryObject().NFilter || {};

    const combinedParams = merge(initParams, qsParams);
    this.state = {
      statuses: [],
      qsParams: combinedParams
    };

    if (combinedParams) {
      props.callback(combinedParams);
    }

    this.queryStatuses(props.neoServer, props.datasetstr);
    this.queryStatusDefinitions(props.neoServer, props.datasetstr);
  }

  componentWillReceiveProps(nextProps) {
    const { neoServer, datasetstr } = this.props;
    if (nextProps.neoServer !== neoServer || nextProps.datasetstr !== datasetstr) {
      this.queryStatuses(nextProps.neoServer, nextProps.datasetstr);
      this.queryStatusDefinitions(nextProps.neoServer, nextProps.datasetstr);
      const { qsParams } = this.state;
      const statusFilters = [];
      const newParams = Object.assign({}, qsParams, { statusFilters });
      setQueryString({ NFilter: { statusFilters } });
      this.setState({ qsParams: newParams });
    }
  }

  queryStatuses = (neoServer, dataset) => {
    const { actions } = this.props;
    if (neoServer === '') {
      return;
    }

    const setState = this.setState.bind(this);
    fetch('/api/npexplorer/neuronmetavals', {
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({ dataset, key_name: 'status' }),
      method: 'POST',
      credentials: 'include'
    })
      .then(result => {
        if (result.ok) {
          return result.json();
        }
        throw new Error(
          'Unable to fetch status list, try reloading the page. If this error persists, please contact support.'
        );
      })
      .then(resp => {
        const statusList = resp.data.map(status => status[0]).filter(status => status !== null);
        setState({ statuses: statusList });
      })
      .catch(error => {
        actions.metaInfoError(error);
      });
  };

  queryStatusDefinitions = (neoServer, dataset) => {
    const { actions } = this.props;
    if (neoServer === '' || dataset === '') {
      return;
    }

    fetch('/api/custom/custom', {
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        dataset,
        cypher: `MATCH (n:Meta{dataset:"${dataset}"}) RETURN n.statusDefinitions`
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

  toggleNeuron = () => {
    const { qsParams } = this.state;
    const { callback } = this.props;
    const val = !qsParams.limitNeurons;

    const newparams = Object.assign({}, qsParams, { limitNeurons: val });

    callback(newparams);
    setQueryString({ NFilter: { limitNeurons: val } });
    this.setState({ qsParams: newparams });
  };

  handleStatus = selected => {
    const { qsParams } = this.state;
    const { callback } = this.props;
    const statusFilters = selected.map(item => item.value);
    const newParams = Object.assign({}, qsParams, { statusFilters });
    // save back status selections
    callback(newParams);
    setQueryString({ NFilter: { statusFilters } });
    this.setState({ qsParams: newParams });
  };

  handlePreChange = event => {
    const { qsParams } = this.state;
    const { callback } = this.props;
    const preThreshold = event.target.value;
    const newParams = Object.assign({}, qsParams, { preThreshold });
    callback(newParams);
    setQueryString({ NFilter: { preThreshold } });
    this.setState({ qsParams: newParams });
  };

  handlePostChange = event => {
    const { qsParams } = this.state;
    const { callback } = this.props;
    const postThreshold = event.target.value;
    const newParams = Object.assign({}, qsParams, { postThreshold });
    callback(newParams);
    setQueryString({ NFilter: { postThreshold } });
    this.setState({ qsParams: newParams });
  };

  render() {
    const { classes } = this.props;
    const { qsParams, statuses, statusDefinitions } = this.state;
    const checkboxStatus = qsParams.limitNeurons;

    const statusOptions = statuses.map(name => ({
      label: name,
      value: name
    }));

    const statusValue = qsParams.statusFilters.map(roi => ({
      label: roi,
      value: roi
    }));

    return (
      <div className={classes.expandablePanel}>
        <ExpansionPanel>
          <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1">Optional neuron/segment filters</Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails className={classes.nopad}>
            <FormControl className={classes.formControl}>
              <FormControl className={classes.formControl}>
                <FormControlLabel
                  control={
                    <Switch checked={checkboxStatus} onChange={this.toggleNeuron} color="primary" />
                  }
                  label={
                    <Typography variant="subtitle1" style={{ display: 'inline-flex' }}>
                      Limit to neurons
                      <Tooltip
                        id="tooltip-icon"
                        title="Limit to neurons (bodies with >=2 t-bars, >=10 psds, name, soma, or status)"
                        placement="right"
                      >
                        <div className={classes.tooltip}>?</div>
                      </Tooltip>
                    </Typography>
                  }
                />
              </FormControl>
              <TextField
                label="minimum # pre (optional)"
                type="number"
                variant="outlined"
                margin="dense"
                rows={1}
                value={qsParams.preThreshold}
                rowsMax={1}
                className={classes.textField}
                onChange={this.handlePreChange}
              />
              <TextField
                label="minimum # post (optional)"
                variant="outlined"
                margin="dense"
                type="number"
                rows={1}
                value={qsParams.postThreshold}
                rowsMax={1}
                className={classes.textField}
                onChange={this.handlePostChange}
              />
              <FormControl className={classes.formControl}>
                <FormLabel style={{ display: 'inline-flex' }}>
                  Filter by status
                  <Tooltip id="tooltip-icon" title={statusDefinitions || ''} placement="right">
                    <div className={classes.tooltip}>?</div>
                  </Tooltip>
                </FormLabel>
                <Select
                  className={classes.select}
                  isMulti
                  value={statusValue}
                  onChange={this.handleStatus}
                  options={statusOptions}
                  closeMenuOnSelect={false}
                />
              </FormControl>
            </FormControl>
          </ExpansionPanelDetails>
        </ExpansionPanel>
      </div>
    );
  }
}

NeuronFilter.propTypes = {
  callback: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
  datasetstr: PropTypes.string.isRequired,
  neoServer: PropTypes.string.isRequired
};

const NeuronFilterState = state => ({
  urlQueryString: state.app.get('urlQueryString'),
  neoServer: state.neo4jsettings.get('neoServer')
});

const NeuronFilterDispatch = dispatch => ({
  actions: {
    setURLQs(querystring) {
      dispatch(setUrlQS(querystring));
    },
    metaInfoError(error) {
      dispatch(metaInfoError(error));
    }
  }
});

export default withStyles(styles, { withTheme: true })(
  connect(
    NeuronFilterState,
    NeuronFilterDispatch
  )(NeuronFilter)
);
