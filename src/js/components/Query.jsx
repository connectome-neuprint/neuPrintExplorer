/*
 * Main page holding query selector and query forms.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Select from 'react-select';
import { withRouter } from 'react-router-dom';
import slug from 'slugg';
import Tooltip from '@material-ui/core/Tooltip';
import Button from '@material-ui/core/Button';
import InputLabel from '@material-ui/core/InputLabel';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import { withStyles } from '@material-ui/core/styles';
import Icon from '@material-ui/core/Icon';

import QueryForm from './QueryForm';
import { getSiteParams, setQueryString } from '../helpers/queryString';

import './Query.css';

const styles = theme => ({
  root: {
    padding: theme.spacing.unit * 3
  },
  divider: {
    marginTop: theme.spacing.unit,
    marginBottom: theme.spacing.unit
  },
  chips: {
    display: 'flex',
    flexWrap: 'wrap'
  },
  arrow: {
    position: 'absolute',
    top: '4px',
    marginLeft: '4px',
    fontWeight: 'bold'
  },
  dataset: {
    background: theme.palette.common.white,
    color: theme.palette.error.dark,
    fontWeight: 'bold',
    borderRadius: theme.spacing.unit * 2,
    marginBottom: theme.spacing.unit * 2,
    position: 'relative'
  },
  chip: {
    margin: theme.spacing.unit / 4
  },
  select: {
    fontFamily: theme.typography.fontFamily,
    margin: '0.5em 0 1em 0'
  },
  experimentalPlugin: {
    display: 'inline-flex',
    verticalAlign: 'center'
  }
});

class Query extends React.Component {
  handleQueryTypeSelection() {
    setQueryString({ q: 2});
  }

  render() {
    const { classes, pluginList, location } = this.props;
    const qsParams = getSiteParams(location);

    const queryType = qsParams.get('qt') || 'not selected';
    const queryName =
      pluginList
        .filter(plugin => slug(plugin.details.name) === queryType)
        .map(plugin => plugin.details.displayName)[0] || 'Select Query';

    const generalOptions = pluginList
      .filter(plugin => plugin.details.category === undefined)
      .map(val => ({
        value: slug(val.details.name),
        label: val.details.experimental ? (
          <div className={classes.experimentalPlugin}>
            {val.details.displayName}
            <Tooltip title="under development" placement="right">
              <Icon style={{ margin: '4px', fontSize: '12px' }}>build</Icon>
            </Tooltip>
          </div>
        ) : (
          val.details.displayName
        )
      }));

    const reconOptions = pluginList
      .filter(plugin => plugin.details.category === 'recon')
      .map(val => ({
        value: slug(val.details.name),
        label: val.details.experimental ? (
          <div className={classes.experimentalPlugin}>
            {val.details.displayName}
            <Tooltip title="under development" placement="right">
              <Icon style={{ margin: '4px', fontSize: '12px' }}>build</Icon>
            </Tooltip>
          </div>
        ) : (
          val.details.displayName
        )
      }));

    const otherOptions = pluginList
      .filter(plugin => plugin.details.category === 'visualization')
      .map(val => ({
        value: slug(val.details.name),
        label: val.details.experimental ? (
          <div className={classes.experimentalPlugin}>
            {val.details.displayName}
            <Tooltip title="under development" placement="right">
              <Icon style={{ margin: '4px', fontSize: '12px' }}>build</Icon>
            </Tooltip>
          </div>
        ) : (
          val.details.displayName
        )
      }));

    const queryOptions = [
      {
        label: 'General',
        options: generalOptions
      },
      {
        label: 'Reconstruction Related',
        options: reconOptions
      },
      {
        label: 'Visualization',
        options: otherOptions
      }
    ];

    const dataSet = qsParams.get('dataset') || '';

    // TODO: fix default menu option (maybe make the custom query the default)
    return (
      <div className={classes.root}>
        {dataSet === '' && (
          <Typography className={classes.dataset} variant="h6">
            Please select a data set above
            <Icon className={classes.arrow}>arrow_upward</Icon>
          </Typography>
        )}
        <Button variant="contained" color="primary" onClick={() => this.handleQueryTypeSelection()}>
          Change Query Type
        </Button>

        <Divider className={classes.divider} />
        <Typography variant="h5">{queryName}</Typography>
        <QueryForm queryType={queryType} dataSet={dataSet} />
      </div>
    );
  }
}

Query.propTypes = {
  pluginList: PropTypes.arrayOf(PropTypes.func).isRequired,
  classes: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired
};

const QueryState = state => ({
  pluginList: state.app.get('pluginList')
});

export default withRouter(withStyles(styles, { withTheme: true })(connect(QueryState)(Query)));
