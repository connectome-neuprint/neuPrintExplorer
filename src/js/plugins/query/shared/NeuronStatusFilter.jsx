/*
 * Form to provide filters based on neuron status.
 */

import React from 'react';
import PropTypes from 'prop-types';
import merge from 'deepmerge';
import withStyles from '@mui/styles/withStyles';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import Select from 'react-select';
import Tooltip from '@mui/material/Tooltip';

const styles = theme => ({
  formControl: {
    minWidth: 250,
    maxWidth: 350
  },
  nopad: {
    padding: 0
  },
  select: {
    fontFamily: theme.typography.fontFamily,
    margin: 0,
    marginTop: theme.spacing(1)
  },
  textField: {
    maxWidth: 230,
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1)
  },
  tooltip: {
    color: 'red',
    verticalAlign: 'super',
    fontSize: '80%',
    marginLeft: theme.spacing(2)
  }
});

class NeuronStatusFilter extends React.Component {
  constructor(props) {
    super(props);

    const initParams = {
      limitNeurons: true,
      statusFilters: ['Traced'],
      preThreshold: '',
      postThreshold: ''
    };

    const qsParams = props.actions.getQueryObject().NFilter || {};

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

    UNSAFE_componentWillReceiveProps(nextProps) {
    const { neoServer, datasetstr, actions } = this.props;
    if (nextProps.neoServer !== neoServer || nextProps.datasetstr !== datasetstr) {
      this.queryStatuses(nextProps.neoServer, nextProps.datasetstr);
      this.queryStatusDefinitions(nextProps.neoServer, nextProps.datasetstr);
      const { qsParams } = this.state;
      const statusFilters = [];
      const newParams = {...qsParams, ...{ statusFilters }};
      actions.setQueryString({ NFilter: { statusFilters } });
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

    fetch('/api/custom/custom?np_explorer=neuron_filter_status', {
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

  handleStatus = selected => {
    const { qsParams } = this.state;
    const { callback, actions } = this.props;
    const statusFilters = selected ? selected.map(item => item.value) : [];
    const newParams = {...qsParams, ...{statusFilters}};
    // save back status selections
    callback(newParams);
    actions.setQueryString({ NFilter: { statusFilters } });
    this.setState({ qsParams: newParams });
  };

  render() {
    const { classes } = this.props;
    const { qsParams, statuses, statusDefinitions } = this.state;

    const statusOptions = statuses.map(name => ({
      label: name,
      value: name
    }));

    const statusValue = qsParams.statusFilters.map(roi => ({
      label: roi,
      value: roi
    }));

    return (
      <div>
        <FormControl variant="standard" className={classes.formControl}>
          <FormControl variant="standard" className={classes.formControl}>
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
            <p>If a status is not chosen, &quot;Traced&quot; status will be used</p>
          </FormControl>
        </FormControl>
      </div>
    );
  }
}

NeuronStatusFilter.propTypes = {
  callback: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
  datasetstr: PropTypes.string.isRequired,
  neoServer: PropTypes.string.isRequired
};

export default withStyles(styles, { withTheme: true })(NeuronStatusFilter);
