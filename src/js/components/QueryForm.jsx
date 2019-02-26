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

import { formError, pluginResponseError } from 'actions/plugins';
import { metaInfoError, launchNotification } from 'actions/app';
import { skeletonAddandOpen } from 'actions/skeleton';
import { neuroglancerAddandOpen } from 'actions/neuroglancer';
import {
  getQueryString,
  getSiteParams,
  setPluginQueryString,
  getPluginQueryObject,
  setSearchQueryString,
  getQueryObject
} from 'helpers/queryString';

const styles = theme => ({
  divider: {
    marginTop: theme.spacing.unit,
    marginBottom: theme.spacing.unit
  }
});

const failureMessage =
  'There was a problem rendering the plugin form. Please contact the developer of this continues.';

class QueryForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      openSnack: false,
      hasError: false
    };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidUpdate(prevProps) {
    const { queryType } = this.props;
    if (queryType !== prevProps.queryType) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ hasError: false });
    }
  }

  submit = (query) => {
    const { history } = this.props;
    // TODO: set query as a tab in the url query string.
    setSearchQueryString({
      code: query.pluginCode,
      ds: query.dataSet,
      pm: query.parameters
    });
    const newQueryString = getQueryObject();
    history.push({
      pathname: '/results',
      search: getQueryString()
    });
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
      neoServerSettings
    } = this.props;
    const { openSnack, hasError } = this.state;

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
        {hasError ? (
          failureMessage
        ) : (
          <CurrentQuery
            datasetstr={dataSet}
            dataSet={dataSet}
            availableROIs={currROIs}
            disable={isQuerying}
            isQuerying={isQuerying}
            neoServerSettings={neoServerSettings}
            actions={actions}
            submit={this.submit}
          />
        )}
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
  history: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
  neoServerSettings: PropTypes.object.isRequired,
  availableROIs: PropTypes.object.isRequired
};

const QueryFormState = state => ({
  pluginList: state.app.get('pluginList'),
  isQuerying: state.query.get('isQuerying'),
  neoError: state.query.get('neoError'),
  userInfo: state.user.get('userInfo'),
  neoServerSettings: state.neo4jsettings,
  availableROIs: state.neo4jsettings.get('availableROIs')
});

const QueryFormDispatch = dispatch => ({
  actions: {
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
    getSiteParams: location => getSiteParams(location),
    setQueryString: newData => setPluginQueryString(newData),
    getQueryObject: plugin => getPluginQueryObject(plugin),
    launchNotification: message => dispatch(launchNotification(message))
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
