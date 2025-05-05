/*
 * Form to provide filters based on neuron properties.
 */

import React from 'react';
import PropTypes from 'prop-types';
import merge from 'deepmerge';
import withStyles from '@mui/styles/withStyles';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Typography from '@mui/material/Typography';
import Select from 'react-select';
import TextField from '@mui/material/TextField';

const styles = theme => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 250,
    maxWidth: 350
  },
  expandablePanel: {
    margin: theme.spacing(1)
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

class NeuronFilter extends React.Component {
  constructor(props) {
    super(props);

    const initParams = {
      status: [],
      pre: '',
      post: ''
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
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const { neoServer, datasetstr, actions } = this.props;
    if (nextProps.neoServer !== neoServer || nextProps.datasetstr !== datasetstr) {
      this.queryStatuses(nextProps.neoServer, nextProps.datasetstr);
      const { qsParams } = this.state;
      const status = [];
      const newParams = {...qsParams, status};
      actions.setQueryString({ NFilter: { status } });
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

  handleChange = (selected, paramType) => {
    const { qsParams } = this.state;
    const { callback, actions } = this.props;
    const values = selected ? selected.map(item => item.value) : [];
    const newParams = {...qsParams, ...{ [paramType]: values }};
    // save back status selections
    callback(newParams);
    actions.setQueryString({ NFilter: { [paramType]: values } });
    this.setState({ qsParams: newParams });
  };

  handleTextChange = (event, paramType) => {
    const { qsParams } = this.state;
    const { callback, actions } = this.props;
    const {value} = event.target;
    const newParams = {...qsParams, ...{ [paramType]: value }};
    callback(newParams);
    actions.setQueryString({ NFilter: { [paramType]: value } });
    this.setState({ qsParams: newParams });
  };

  render() {
    const { classes } = this.props;
    const { qsParams, statuses } = this.state;

    const statusOptions = statuses.map(name => ({
      label: name,
      value: name
    }));

    const statusValue = qsParams.status.map(roi => ({
      label: roi,
      value: roi
    }));

    return (
      <div className={classes.expandablePanel}>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1">Optional neuron/segment filters</Typography>
          </AccordionSummary>
          <AccordionDetails className={classes.nopad}>
            <FormControl variant="standard" className={classes.formControl}>
              <TextField
                label="minimum # pre (optional)"
                type="number"
                variant="outlined"
                margin="dense"
                rows={1}
                value={qsParams.pre}
                maxRows={1}
                className={classes.textField}
                onChange={(event) => this.handleTextChange(event, 'pre')}
              />
              <TextField
                label="minimum # post (optional)"
                variant="outlined"
                margin="dense"
                type="number"
                rows={1}
                value={qsParams.post}
                maxRows={1}
                className={classes.textField}
                onChange={(event) => this.handleTextChange(event, 'post')}
              />
              <FormControl variant="standard" className={classes.formControl}>
                <FormLabel style={{ display: 'inline-flex' }}>
                  Filter by status
                </FormLabel>
                <Select
                  className={classes.select}
                  isMulti
                  value={statusValue}
                  onChange={(event) => this.handleChange(event, 'status')}
                  options={statusOptions}
                  closeMenuOnSelect={false}
                />
              </FormControl>
            </FormControl>
          </AccordionDetails>
        </Accordion>
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

export default withStyles(styles, { withTheme: true })(NeuronFilter);
