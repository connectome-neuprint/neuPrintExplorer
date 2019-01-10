/*
 * Query form that calls specific plugins for form input an doutput processing.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import slug from 'slugg';

import Snackbar from '@material-ui/core/Snackbar';
import { withRouter } from 'react-router-dom';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import { withStyles } from '@material-ui/core/styles';

import { submit, formError, pluginResponseError } from 'actions/plugins';
import { metaInfoError } from 'actions/app';
import { skeletonAddandOpen } from 'actions/skeleton';
import { neuroglancerAddandOpen } from 'actions/neuroglancer';
import { getQueryString, getSiteParams, setQueryString, getQueryObject } from 'helpers/queryString';
import { LoadQueryString, SaveQueryString } from 'helpers/qsparser';

const styles = theme => ({
  divider: {
    marginTop: theme.spacing.unit,
    marginBottom: theme.spacing.unit
  }
});

class QueryForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      openSnack: false
    };
  }

  findCurrentPlugin = () => {
    const { pluginList, queryType } = this.props;
    // find matching query type
    const CurrentQuery =
      pluginList.find(plugin => slug(plugin.queryName) === queryType) || pluginList[0];
    return CurrentQuery;
  };

  handleClose = () => {
    this.setState({ openSnack: false });
  };

  render() {
    // assume the first query is the default
    const CurrentQuery = this.findCurrentPlugin();
    const {
      userInfo,
      classes,
      actions,
      dataSet,
      availableROIs,
      isQuerying,
      urlQueryString,
      neoServerSettings
    } = this.props;
    const { openSnack } = this.state;
    let currROIs = [];

    if (dataSet in availableROIs) {
      currROIs = availableROIs[dataSet];
    }

    return (
      <div>
        <Snackbar
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          open={openSnack}
          onClose={this.handleClose}
          SnackbarContentProps={{
            'aria-describedby': 'message-id'
          }}
          message={
            <span id="message-id">
              {userInfo === null
                ? 'User must log in'
                : 'User not authorized for this server (please contact admin)'}
            </span>
          }
        />
        <Typography>{CurrentQuery.queryDescription}</Typography>
        <Divider className={classes.divider} />
        <CurrentQuery
          datasetstr={dataSet}
          dataSet={dataSet}
          availableROIs={currROIs}
          disable={isQuerying}
          isQuerying={isQuerying}
          urlQueryString={urlQueryString}
          neoServerSettings={neoServerSettings}
          actions={actions}
        />
      </div>
    );
  }
}

QueryForm.propTypes = {
  queryType: PropTypes.string.isRequired,
  userInfo: PropTypes.object.isRequired,
  pluginList: PropTypes.arrayOf(PropTypes.func).isRequired,
  dataSet: PropTypes.string.isRequired,
  isQuerying: PropTypes.bool.isRequired,
  classes: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
  urlQueryString: PropTypes.string.isRequired,
  neoServerSettings: PropTypes.object.isRequired,
  availableROIs: PropTypes.object.isRequired
};

const QueryFormState = state => ({
  pluginList: state.app.get('pluginList'),
  isQuerying: state.query.isQuerying,
  neoError: state.query.neoError,
  userInfo: state.user.get('userInfo'),
  urlQueryString: state.app.get('urlQueryString'),
  neoServerSettings: state.neo4jsettings,
  availableROIs: state.neo4jsettings.get('availableROIs')
});

const QueryFormDispatch = dispatch => ({
  actions: {
    submit: query => {
      dispatch(submit(query));
    },
    skeletonAddandOpen: (id, dataSet) => {
      dispatch(skeletonAddandOpen(id, dataSet));
    },
    neuroglancerAddandOpen: (id, dataSet) => {
      dispatch(neuroglancerAddandOpen(id, dataSet));
    },
    formError: query => {
      dispatch(formError(query));
    },
    metaInfoError(error) {
      dispatch(metaInfoError(error));
    },
    pluginResponseError: error => {
      dispatch(pluginResponseError(error));
    },
    getQueryString: () => getQueryString(),
    SaveQueryString: (queryName, oldParams) => SaveQueryString(queryName, oldParams),
    LoadQueryString: (queryName, initQsParams, urlQueryString) =>
      LoadQueryString(queryName, initQsParams, urlQueryString),
    getSiteParams: location => getSiteParams(location),
    setQueryString: newData => setQueryString(newData),
    getQueryObject: () => getQueryObject()
  }
});

export default withRouter(
  withStyles(styles)(
    connect(
      QueryFormState,
      QueryFormDispatch
    )(QueryForm)
  )
);
