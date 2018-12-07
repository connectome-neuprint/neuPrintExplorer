/*
 * Form to provide filters based on neuron properties.
*/

import React from 'react';
import PropTypes from 'prop-types';
import merge from 'deepmerge';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Typography from '@material-ui/core/Typography';
import Select from '@material-ui/core/Select';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import Chip from '@material-ui/core/Chip';
import MenuItem from '@material-ui/core/MenuItem';
import Tooltip from '@material-ui/core/Tooltip';
import { setUrlQS, metaInfoError } from '../actions/app';
import { getQueryObject, setQueryString } from '../helpers/queryString';

const styles = theme => ({
  formControl: {
    margin: theme.spacing.unit,
    minWidth: 250,
    maxWidth: 300
  },
  expandablePanel: {
    margin: theme.spacing.unit
  },
  nopad: {
    padding: 0
  },
  chip: {
    margin: theme.spacing.unit / 4
  }
});

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250
    }
  }
};

class NeuronFilter extends React.Component {
  constructor(props) {
    super(props);

    const initParams = {
      limitBig: true,
      statusFilters: []
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
  }

  componentWillReceiveProps(nextProps) {
    const { neoServer, datasetstr } = this.props;
    if (
      nextProps.neoServer !== neoServer ||
      nextProps.datasetstr !== datasetstr
    ) {
      this.queryStatuses(nextProps.neoServer, nextProps.datasetstr);
    }
  }

  queryStatuses = (neoServer, datasetstr) => {
    const { actions } = this.props;
    if (neoServer === '') {
      return;
    }

    const setState = this.setState.bind(this);
    fetch('/api/npexplorer/neuronmetavals', {
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({ dataset: datasetstr, key_name: 'status' }),
      method: 'POST',
      credentials: 'include'
    })
      .then(result => {
        if (result.ok) {
          return result.json();
        }
        throw new Error('Unable to fetch status list, try reloading the page. If this error persists, please contact support.');
      })
      .then(resp => {
        const statusList = resp.data.map(status => status[0]);
        setState({ statuses: statusList });
      })
      .catch((error) => {
        actions.metaInfoError(error);
      });
  };

  toggleBig = () => {
    const { qsParams } = this.state;
    const { callback } = this.props;
    const val = !qsParams.limitBig;

    const newparams = Object.assign({}, qsParams, { limitBig: val });

    callback(newparams);
    setQueryString({ NFilter: { limitBig: val } });
    this.setState({ qsParams: newparams });
  };

  handleStatus = event => {
    const { qsParams } = this.state;
    const { callback } = this.props;
    let statuses = event.target.value;
    if (event === undefined) {
      statuses = [];
    }
    const newparams = Object.assign({}, qsParams, { statusFilters: statuses });

    // save back status selections
    callback(newparams);
    setQueryString({ NFilter: { statusFilters: statuses } });
    this.setState({ qsParams: newparams });
  };

  render() {
    const { classes, theme } = this.props;
    const { qsParams, statuses } = this.state;
    let checkboxStatus = true;
    if (qsParams) {
      checkboxStatus = qsParams.limitBig;
    }
    return (
      <ExpansionPanel className={classes.expandablePanel}>
        <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Optional neuron/segment filters</Typography>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails className={classes.nopad}>
          <FormControl className={classes.formControl}>
            <FormControl className={classes.formControl}>
              <Tooltip
                id="tooltip-big"
                title="Limit to big neurons (>10 pre or post synapses)"
                placement="bottom-start"
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={checkboxStatus}
                      onChange={this.toggleBig}
                      value="checkedBig"
                    />
                  }
                  label="Limit to big segments"
                />
              </Tooltip>
            </FormControl>
            <FormControl className={classes.formControl}>
              <InputLabel htmlFor="select-multiple-chip-status">Neuron status</InputLabel>
              <Select
                multiple
                value={qsParams.statusFilters}
                onChange={this.handleStatus}
                input={<Input id="select-multiple-chip-status" />}
                renderValue={selected => (
                  <div className={classes.chips}>
                    {selected.map(value => (
                      <Chip key={value} label={value} className={classes.chip} />
                    ))}
                  </div>
                )}
                MenuProps={MenuProps}
              >
                {statuses.map(name => (
                  <MenuItem
                    key={name}
                    value={name}
                    style={{
                      fontWeight:
                        qsParams.statusFilters.indexOf(name) === -1
                          ? theme.typography.fontWeightRegular
                          : theme.typography.fontWeightMedium
                    }}
                  >
                    {name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </FormControl>
        </ExpansionPanelDetails>
      </ExpansionPanel>
    );
  }
}

NeuronFilter.propTypes = {
  callback: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
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
