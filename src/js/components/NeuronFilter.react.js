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
import { setUrlQS } from '../actions/app';
import NeuPrintResult from '../helpers/NeuPrintResult';
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
      this.props.callback(combinedParams);
    }

    this.queryStatuses(this.props.neoServer, this.props.datasetstr);
  }

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.neoServer !== this.props.neoServer ||
      nextProps.datasetstr !== this.props.datasetstr
    ) {
      this.queryStatuses(nextProps.neoServer, nextProps.datasetstr);
    }
  }

  queryStatuses = (neoServer, datasetstr) => {
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
      .then(result => result.json())
      .then(resp => {
        let statuslist = [];
        // parse query
        let result = new NeuPrintResult(resp);
        result.records.forEach(function(record) {
          let val = record.get('val');
          if (val !== null) {
            statuslist.push(val);
          }
        });
        setState({ statuses: statuslist });
      })
      .catch(function(error) {
        alert(error);
      });
  };

  toggleBig = () => {
    let val = !this.state.qsParams.limitBig;

    let newparams = Object.assign({}, this.state.qsParams, { limitBig: val });

    this.props.callback(newparams);
    setQueryString({ NFilter: { limitBig: val } });
    this.setState({ qsParams: newparams });
  };

  handleStatus = event => {
    let statuses = event.target.value;
    if (event === undefined) {
      statuses = [];
    }
    let newparams = Object.assign({}, this.state.qsParams, { statusFilters: statuses });

    // save back status selections
    this.props.callback(newparams);
    setQueryString({ NFilter: { statusFilters: statuses } });
    this.setState({ qsParams: newparams });
  };

  render() {
    const { classes, theme } = this.props;
    const { qsParams } = this.state;
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
                {this.state.statuses.map(name => (
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
  setURLQs: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
  urlQueryString: PropTypes.string.isRequired,
  datasetstr: PropTypes.string.isRequired,
  neoServer: PropTypes.string.isRequired
};

var NeuronFilterState = function(state) {
  return {
    urlQueryString: state.app.get('urlQueryString'),
    neoServer: state.neo4jsettings.get('neoServer')
  };
};

var NeuronFilterDispatch = function(dispatch) {
  return {
    setURLQs: function(querystring) {
      dispatch(setUrlQS(querystring));
    }
  };
};

export default withStyles(styles, { withTheme: true })(
  connect(
    NeuronFilterState,
    NeuronFilterDispatch
  )(NeuronFilter)
);
