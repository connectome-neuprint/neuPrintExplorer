/*
 * Main page holding query selector and query forms.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import slug from 'slugg';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import { withStyles } from '@material-ui/core/styles';
import Icon from '@material-ui/core/Icon';

import QueryForm from './QueryForm';
import { getSiteParams, setQueryString } from '../helpers/queryString';

import './Query.css';

const styles = theme => ({
  root: {
    padding: theme.spacing(3)
  },
  divider: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1)
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
    borderRadius: theme.spacing(2),
    marginBottom: theme.spacing(2),
    position: 'relative'
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

function handleQueryTypeSelection() {
  setQueryString({ q: 2 });
}

function Query(props) {
  const { classes, pluginList, location } = props;
  const qsParams = getSiteParams(location);

  const queryType = qsParams.get('qt') || 'not selected';
  const openQuery = qsParams.get('q');
  const queryName =
    pluginList
      .filter(plugin => slug(plugin.details.name) === queryType)
      .map(plugin => plugin.details.displayName)[0] || 'Select Query';

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
      {openQuery !== '2' && (
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleQueryTypeSelection()}
        >
          Change Query Type
        </Button>
      )}

      <Divider className={classes.divider} />
      <Typography variant="h5">{queryName}</Typography>
      <QueryForm queryType={queryType} dataSet={dataSet} />
    </div>
  );
}

Query.propTypes = {
  pluginList: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.func,
      PropTypes.object,
    ])).isRequired,
  classes: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired
};

const QueryState = state => ({
  pluginList: state.app.get('pluginList')
});

export default withRouter(withStyles(styles, { withTheme: true })(connect(QueryState)(Query)));
