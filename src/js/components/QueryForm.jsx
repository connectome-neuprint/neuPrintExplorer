/* global PUBLIC */
/*
 * Query form that calls specific plugins for form input an doutput processing.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import slug from 'slugg';

import Snackbar from '@mui/material/Snackbar';
import { withRouter } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import { withStyles } from '@material-ui/core/styles';

import { formError, pluginResponseError } from 'actions/plugins';
import { metaInfoError, launchNotification } from 'actions/app';
import {
  getQueryString,
  getQueryObject,
  getSiteParams,
  setPluginQueryString,
  getPluginQueryObject,
  setSearchQueryString
} from 'helpers/queryString';

const styles = theme => ({
  divider: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1)
  }
});

const failureMessage =
  'There was a problem rendering the plugin form. Please contact the developer if this continues.';

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

  submit = query => {
    const { history, allResults, actions } = this.props;
    // check to see if the tab limit has been reached.
    if (allResults && allResults.size >= 10) {
      // more than ten tabs can cause issues with the url string,
      // which results in the site crashing. To prevent this we stop
      // any further submissions and show a warning message to ask
      // the user to close some of the older tabs.
      actions.metaInfoError('There are too many open tabs to submit another request. Please close some and submit again.');
      return;
    }
    // set query as a tab in the url query string.
    setSearchQueryString({
      code: query.pluginCode,
      ds: query.dataSet,
      pm: query.parameters,
      visProps: query.visProps
    });
    history.push({
      pathname: '/results',
      search: getQueryString()
    });
  };

  findCurrentPlugin = () => {
    const { pluginList, queryType } = this.props;
    // find matching query type
    const CurrentQuery = pluginList.find(plugin => slug(plugin.details.name) === queryType);
    return CurrentQuery;
  };

  handleClose = () => {
    this.setState({ openSnack: false });
  };

  render() {
     const {
      userInfo,
      classes,
      actions,
      dataSet,
      availableROIs,
      superROIsByDataSet,
      roiInfo,
      token,
      isQuerying,
      allResults,
      neoServerSettings,
      vimoServer
    } = this.props;
    const { openSnack, hasError } = this.state;

    const query = getQueryObject();
    const tabIndex = parseInt(query.tab || 0, 10);

    let cypher = '';

    if (allResults.get(tabIndex) && allResults.get(tabIndex).result) {
      cypher = allResults.get(tabIndex).result.debug;
    }

    // assume the first query is the default
    const CurrentQuery = this.findCurrentPlugin();

    if (!CurrentQuery) {
      return <Typography>Please select a query type from the menu above.</Typography>;
    }

    const { AuthLevel: authLevel = 'none' } = userInfo;

    if (CurrentQuery.details.disabled) {
      if (!authLevel.match(/^admin$/)) {
        return <Typography variant="h6">This query is currently disabled.</Typography>;
      }
    }

    let currROIs = [];
    let superROIs = [];

    if (dataSet in availableROIs) {
      currROIs = availableROIs[dataSet];
    }

    if (dataSet in superROIsByDataSet) {
      superROIs = superROIsByDataSet[dataSet];
    }

    return (
      <div>
        <Snackbar
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          open={openSnack}
          onClose={this.handleClose}
          ContentProps={{
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
        <Typography>{CurrentQuery.details.description}</Typography>
        <Divider className={classes.divider} />
        {hasError ? (
          failureMessage
        ) : (
          <CurrentQuery
            datasetstr={dataSet}
            dataSet={dataSet}
            availableROIs={currROIs}
            token={token}
            superROIs={superROIs}
            roiInfo={roiInfo}
            disable={isQuerying}
            isQuerying={isQuerying}
            neoServerSettings={neoServerSettings}
            vimoServer={vimoServer}
            actions={actions}
            submit={this.submit}
            isPublic={PUBLIC} // indicates whether or not the application is in public mode
            key={dataSet}
            cypherFromOpenTab={cypher}
          />
        )}
      </div>
    );
  }
}

QueryForm.propTypes = {
  queryType: PropTypes.string.isRequired,
  userInfo: PropTypes.object.isRequired,
  token: PropTypes.string.isRequired,
  pluginList: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.func,
      PropTypes.object,
    ])).isRequired,
  dataSet: PropTypes.string.isRequired,
  isQuerying: PropTypes.bool.isRequired,
  classes: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
  allResults: PropTypes.object.isRequired,
  neoServerSettings: PropTypes.object.isRequired,
  vimoServer: PropTypes.string.isRequired,
  availableROIs: PropTypes.object.isRequired,
  roiInfo: PropTypes.object.isRequired,
  superROIsByDataSet: PropTypes.object.isRequired
};

const QueryFormState = state => ({
  pluginList: state.app.get('pluginList'),
  isQuerying: state.query.get('isQuerying'),
  neoError: state.query.get('neoError'),
  userInfo: state.user.get('userInfo'),
  token: state.user.get('token'),
  allResults: state.results.get('allResults'),
  neoServerSettings: state.neo4jsettings,
  vimoServer: state.vimoServer.get('url'),
  availableROIs: state.neo4jsettings.get('availableROIs'),
  roiInfo: state.neo4jsettings.get('roiInfo'),
  superROIsByDataSet: state.neo4jsettings.get('superROIs')
});

const QueryFormDispatch = dispatch => ({
  actions: {
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
