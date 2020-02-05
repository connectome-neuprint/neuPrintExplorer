/* global PUBLIC */
/*
 * Main page to hold results from query.  This could be
 * a simple table or a table of tables.
 */
import React, { Suspense } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import clone from 'clone';
import Immutable from 'immutable';
import { withRouter } from 'react-router';

import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import Icon from '@material-ui/core/Icon';

import { skeletonAddandOpen, skeletonRemove, DefaultSynapseRadius } from 'actions/skeleton';
import { neuroglancerAddandOpen } from 'actions/neuroglancer';
import { setFullScreen, clearFullScreen, setSelectedResult, launchNotification } from 'actions/app';
import { setColumnStatus, initColumnStatus } from 'actions/visibleColumns';
import { metaInfoError } from '@neuprint/support';
import { pluginResponseError, fetchData } from 'actions/plugins';

import {
  getQueryObject,
  setQueryString,
  updateResultInQueryString,
  getQueryString,
  setSearchQueryString
} from 'helpers/queryString';

import ResultsTopBar from './ResultsTopBar';
import CypherQuery from './CypherQuery';
import ScrollManager from '../helpers/ScrollManager';

import './Result.css';

const SkeletonView = React.lazy(() => import('../containers/SkeletonView'));

const styles = theme => ({
  root: {
    padding: theme.spacing.unit,
    outline: 0
  },
  resultContent: {
    flex: 1,
    flexDirection: 'column',
    display: 'flex',
    overflow: 'hidden'
  },
  full: {
    flex: 1,
    flexDirection: 'column',
    display: 'flex',
    overflow: 'auto'
  },
  errorText: {
    marginLeft: theme.spacing.unit * 2,
    maxWidth: '800px',
    overflow: 'auto',
    overflowWrap: 'normal',
    wordBreak: 'normal',
    whiteSpace: 'pre-wrap'
  },
  empty: {
    padding: theme.spacing.unit * 3
  },
  scroll: {
    overflow: 'auto',
    flex: 1,
    display: 'flex'
  }
});

function getQueryData(queryData) {
  // If a timestamp is found in the data structure, then it is a saved result
  // and we need to return only the saved data.
  if (queryData.result && queryData.result.resp && queryData.result.resp.timestamp) {
    return JSON.parse(queryData.result.resp.data);
  }
  return queryData;
}

class Result extends React.Component {
  componentDidMount() {
    // grab the contents of the search string.
    // if it has an array of query objects, fetch the data from neuPrint
    // and store it in the redux/local state?
    const { actions, token, tabIndex } = this.props;
    const query = getQueryObject();
    const resultsList = query.qr || [];

    if (resultsList.length > 0) {
      const currentPlugin = this.currentPlugin();
      // only fetch results for the tab being displayed.
      actions.fetchData(resultsList[tabIndex], currentPlugin, tabIndex, token);
      if (Object.prototype.hasOwnProperty.call(currentPlugin, 'getColumnHeaders')) {
        actions.initColumnStatus(tabIndex, currentPlugin.getColumnHeaders(query.qr[tabIndex]));
      }
    }
  }

  componentDidUpdate(prevProps) {
    const {
      location,
      actions,
      token,
      allResults,
      loading,
      loadingError,
      visibleColumns,
      tabIndex
    } = this.props;

    // if the number of tabs has changed, then update the data.
    // if the current tab has changed, then update.
    // if the current page has changed, then update.
    if (!loading.get(tabIndex, false)) {
      const query = getQueryObject();
      // if we switched location, or there are no results and the loading error is empty
      if (
        location !== prevProps.location ||
        (!allResults.get(tabIndex, {}).result && !loadingError.get(tabIndex))
      ) {
        const resultsList = query.qr || [];
        if (resultsList.length > 0) {
          const currentPlugin = this.currentPlugin();
          actions.fetchData(resultsList[tabIndex], currentPlugin, tabIndex, token);
          // if the column values for this tab haven't been set yet, then do so.
          if (
            !visibleColumns.get(tabIndex) &&
            Object.prototype.hasOwnProperty.call(currentPlugin, 'getColumnHeaders')
          ) {
            actions.initColumnStatus(tabIndex, currentPlugin.getColumnHeaders(query.qr[tabIndex]));
          }
        }
      }
    }
  }

  static getDerivedStateFromError(error) {
    return { loadingError: error };
  }

  getViewPlugin(queryPlugin) {
    const { viewPlugins } = this.props;
    return viewPlugins.get(queryPlugin.details.visType);
  }

  getProcessingPlugin(currentPlugin, cachedResults) {
    const { pluginList } = this.props;
    if (currentPlugin.details.abbr === 'sv') {
      const originalPlugin = JSON.parse(cachedResults.data).params.code;
      const processingPlugin = pluginList.find(plugin => plugin.details.abbr === originalPlugin);
      return processingPlugin;
    }
    return currentPlugin;
  }

  submit = query => {
    const { history } = this.props;
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

  // TODO: fix the download button. - why is it broken?
  downloadFile = index => {
    const { allResults } = this.props;
    const results = allResults.get(index);
    let csvData = '';
    if (results) {
      const currentPlugin = this.currentPlugin();

      if (
        Object.prototype.hasOwnProperty.call(currentPlugin, 'processDownload') &&
        typeof currentPlugin.processDownload === 'function'
      ) {
        const resultsCopy = clone(results);
        csvData = currentPlugin.processDownload(resultsCopy);
      } else {
        csvData = `${results.result.columns.toString()}\n`;
        results.result.data.forEach(row => {
          const filteredRow = row.map(item => {
            if (item === null) return '';
            if (item.csvValue !== undefined) return item.csvValue;
            if (item.sortBy !== undefined) return item.sortBy;
            if (item.value !== undefined) return item.value;
            return item;
          });
          csvData += `${filteredRow.toString()}\n`;
        });
      }

      const element = document.createElement('a');
      const file = new Blob([csvData], { type: 'text/csv' });
      element.href = URL.createObjectURL(file);
      element.download = 'results.csv';
      document.body.appendChild(element);
      element.click();
      setTimeout(() => {
        document.body.removeChild(element);
        URL.revokeObjectURL(file);
      }, 100);
    }
  };

  handleResultSelection = (event, value) => {
    // set the tabs value in the query string to the value
    // passed in here.
    setQueryString({ tab: value });
  };

  currentPlugin() {
    const { pluginList, tabIndex } = this.props;
    const query = getQueryObject();
    const resultsList = query.qr || [];
    const currentPlugin = pluginList.find(
      plugin => plugin.details.abbr === resultsList[tabIndex].code
    );
    return currentPlugin;
  }

  render() {
    // TODO: show query runtime results
    const {
      classes,
      loading,
      loadingError,
      allResults,
      actions,
      neoServer,
      neo4jsettings,
      showCypher,
      visibleColumns,
      tabIndex,
      fixed,
      user
    } = this.props;

    const query = getQueryObject();
    const resultsList = query.qr || [];

    if (!loading.get(tabIndex, false) && resultsList.length === 0) {
      return (
        <div className={classes.root}>
          <div className={classes.empty}>
            <Typography variant="h6">No Search Results</Typography>
            <Typography>
              Please use the Menu to the left or the <Icon>search</Icon> icon to start a search.
            </Typography>
          </div>
        </div>
      );
    }

    let tabData = (
      <div className={classes.full}>
        <ResultsTopBar
          downloadEnabled={false}
          downloadCallback={this.downloadFile}
          saveEnabled={false}
          name="Loading..."
          index={tabIndex}
          queryStr="Loading"
          color="#cccccc"
          fixed={fixed}
        />
        <div>Loading...</div>
      </div>
    );

    if (!loading.get(tabIndex, false)) {
      // we have results
      const cachedResults = allResults.get(tabIndex);
      // check that we have some results and they match the plugin we are trying to use.
      if (
        cachedResults &&
        cachedResults.params &&
        cachedResults.params.code === resultsList[tabIndex].code
      ) {
        const currentPlugin = this.currentPlugin();

        if (currentPlugin) {
          // TODO: here is where we should trigger the loading of the view plugins. It is only at this
          // point that we need them. Would need to add a check to see if the plugin has loaded in
          // addition to the content.

          // We need to deep clone the cached result here, because it looks
          // like the plugin can modify the cached results. This can lead to strange
          // behavior now that the results are processed every time the tab is loaded.
          // If we provide a clone of the object, then the plugin can do what it wants,
          // without affecting the stored results.
          const resultsCopy = clone(cachedResults.result);

          const processingPlugin = this.getProcessingPlugin(currentPlugin, resultsCopy);

          // TODO: If this is a saved search, then we need to provide the original visprops
          // to the processResults() function and also modify it based on the input added
          // to the current url query. For example, if the items per page for the saved
          // query was 25, but the user asked for 5, then we need to overwrite it, but
          // preserve all the other properties.
          let combinedQuery = resultsList[tabIndex];
          if (currentPlugin.details.abbr === 'sv') {
            combinedQuery = JSON.parse(cachedResults.result.data).params;
          }

          const currentResult = currentPlugin.processResults({
            query: combinedQuery,
            apiResponse: resultsCopy,
            actions,
            submitFunc: this.submit,
            isPublic: PUBLIC, // PUBLIC indicates this is a public version of the application
            originalPlugin: processingPlugin,
            roiLookup: neo4jsettings.get('roiInfo')
          });

          const combined = Object.assign(combinedQuery, { result: currentResult });

          const downloadEnabled =
            currentPlugin.details.download !== undefined ? currentPlugin.details.download : true;

          const saveEnabled =
            currentPlugin.details.save !== undefined ? currentPlugin.details.save : true;

          const download3DCallback = typeof currentPlugin.download3DSeed === 'function' ? currentPlugin.download3DSeed(combined) : null;
          const clipboardCallback = typeof currentPlugin.clipboardCallback === 'function' ? currentPlugin.clipboardCallback(combined) : null;

          if (combined && combined.code === processingPlugin.details.abbr) {
            // show the header information if not in full screen mode.
            const tabDataHeader =
              query.rt !== 'full' ? (
                <ResultsTopBar
                  downloadEnabled={downloadEnabled}
                  saveEnabled={saveEnabled}
                  addIdEnabled={Boolean(processingPlugin.details.visType === 'SkeletonView')}
                  downloadCallback={this.downloadFile}
                  download3DCallback={download3DCallback}
                  clipboardCallback={clipboardCallback}
                  visibleColumns={visibleColumns.get(tabIndex, Immutable.List([]))}
                  name={combined.result.title || 'Error'}
                  index={tabIndex}
                  fetchedTime={cachedResults.timestamp || null}
                  queryStr={combined.result.debug}
                  resultData={combined.result}
                  color="#cccccc"
                  fixed={fixed}
                  dataSet={resultsList[tabIndex].ds}
                />
              ) : (
                ''
              );

            const View = this.getViewPlugin(processingPlugin);

            // TODO: lazy load skeleton and neuroglancer plugins here as opposed to loading
            // them in the init plugins code.
            if (processingPlugin.details.visType === 'SkeletonView') {
              const queryData = getQueryData(combined);
              const viewKey = `t${tabIndex}`;
              const synapseRadius = (cachedResults && cachedResults.paramsPrivate && cachedResults.paramsPrivate.synapseRadius) ?
                cachedResults.paramsPrivate.synapseRadius :
                DefaultSynapseRadius;
              tabData = (
                <ScrollManager scrollKey={viewKey}>
                  {({ connectScrollTarget }) => (
                    <div className={classes.full} ref={connectScrollTarget}>
                      {tabDataHeader}
                      {showCypher && <CypherQuery cypherString={combined.result.debug} />}
                      <Suspense fallback={<div>loading skeleton viewer...</div>}>
                        <SkeletonView
                          query={queryData}
                          index={tabIndex}
                          key={viewKey}
                          neoServer={neoServer}
                          neo4jsettings={neo4jsettings}
                          synapseRadius={synapseRadius}
                        />
                      </Suspense>
                    </div>
                  )}
                </ScrollManager>
              );
            } else if (View) {
              const queryData = getQueryData(combined);
              const viewKey = `t${tabIndex}`;
              tabData = (
                <ScrollManager scrollKey={viewKey}>
                  {({ connectScrollTarget }) => (
                    <div className={classes.full} ref={connectScrollTarget}>
                      {tabDataHeader}
                      {showCypher && <CypherQuery cypherString={combined.result.debug} />}
                      <View
                        query={queryData}
                        index={tabIndex}
                        key={viewKey}
                        actions={actions}
                        neoServer={neoServer}
                        neo4jsettings={neo4jsettings}
                        visibleColumns={visibleColumns.get(tabIndex, Immutable.List([]))}
                        user={user}
                      />
                    </div>
                  )}
                </ScrollManager>
              );
            } else {
              tabData = (
                <div className={classes.full}>
                  {tabDataHeader}
                  <div>
                    Your browser/OS/drivers do not support WebGL2. In order to use this plugin,
                    please try a different browser.
                  </div>
                </div>
              );
            }
          }
        }
      }
    }

    // Return here with a way to close the tab, if an error
    // occurred loading the data. Maybe add a try again button.

    if (!loading.get(tabIndex, false) && loadingError.get(tabIndex)) {
      tabData = (
        <div className={classes.full}>
          <ResultsTopBar
            downloadCallback={this.downloadFile}
            downloadEnabled={false}
            saveEnabled={false}
            name="Error loading content"
            index={tabIndex}
            queryStr="error"
            color="#ffcccc"
            fixed={fixed}
            dataSet={resultsList[tabIndex].ds}
          />
          {/*
           Some of the error messages are returned from the server as plain text with
           a set amount of white space used to indicate where the error occurs. So
           placing them in a pre tag preserves the indicator location in a web
           page.
            */}
          <div>
            <pre className={classes.errorText}>{loadingError.get(tabIndex).toString()}</pre>
          </div>
        </div>
      );
    }

    return <div className={classes.scroll}>{tabData}</div>;
  }
}

Result.propTypes = {
  location: PropTypes.shape({
    search: PropTypes.string.isRequired
  }).isRequired,
  allResults: PropTypes.object.isRequired,
  pluginList: PropTypes.arrayOf(PropTypes.func).isRequired,
  viewPlugins: PropTypes.object.isRequired,
  loadingError: PropTypes.object,
  loading: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  neoServer: PropTypes.string.isRequired,
  token: PropTypes.string.isRequired,
  neo4jsettings: PropTypes.object.isRequired,
  showCypher: PropTypes.bool.isRequired,
  visibleColumns: PropTypes.object.isRequired,
  tabIndex: PropTypes.number.isRequired,
  fixed: PropTypes.bool,
  user: PropTypes.object.isRequired
};

Result.defaultProps = {
  loadingError: Immutable.List([]),
  fixed: false
};

// result data [{name: "table name", header: [headers...], body: [rows...]
const ResultState = state => ({
  pluginList: state.app.get('pluginList'),
  loading: state.results.get('loading'),
  loadingError: state.results.get('loadingError'),
  allResults: state.results.get('allResults'),
  showCypher: state.results.get('showCypher'),
  viewPlugins: state.app.get('viewPlugins'),
  showSkel: state.skeleton.get('display'),
  userInfo: state.user.get('userInfo'),
  selectedResult: state.app.get('selectedResult'),
  queryObj: state.query.get('neoQueryObj'),
  fullscreen: state.app.get('fullscreen'),
  neo4jsettings: state.neo4jsettings,
  token: state.user.get('token'),
  neoServer: state.neo4jsettings.get('neoServer'),
  visibleColumns: state.visibleColumns.get('tab'),
  user: state.user
});

const ResultDispatch = dispatch => ({
  actions: {
    setFullScreen: viewer => {
      dispatch(setFullScreen(viewer));
    },
    clearFullScreen: () => {
      dispatch(clearFullScreen());
    },
    setSelectedResult: index => {
      dispatch(setSelectedResult(index));
    },
    // TODO: change this to modify the url instead of the state.
    updateQuery: (index, newQueryObject) => {
      updateResultInQueryString(index, newQueryObject);
    },
    metaInfoError: error => {
      dispatch(metaInfoError(error));
    },
    pluginResponseError: error => {
      dispatch(pluginResponseError(error));
    },
    launchNotification: message => dispatch(launchNotification(message)),
    skeletonAddandOpen: (id, dataSet) => {
      dispatch(skeletonAddandOpen(id, dataSet));
    },
    skeletonRemove: (id, dataSet, tabIndex) => {
      dispatch(skeletonRemove(id, dataSet, tabIndex));
    },
    neuroglancerAddandOpen: (id, dataSet) => {
      dispatch(neuroglancerAddandOpen(id, dataSet));
    },
    getQueryObject: (id, empty) => getQueryObject(id, empty),
    setQueryString: data => setQueryString(data),
    fetchData: (qParams, plugin, tabPosition, token) => {
      dispatch(fetchData(qParams, plugin, tabPosition, token));
    },
    setColumnStatus: (tabIndex, columnIndex, status) => {
      dispatch(setColumnStatus(tabIndex, columnIndex, status));
    },
    initColumnStatus: (tabIndex, columns) => {
      dispatch(initColumnStatus(tabIndex, columns));
    }
  }
});

export default withRouter(
  withStyles(styles)(
    connect(
      ResultState,
      ResultDispatch
    )(Result)
  )
);
