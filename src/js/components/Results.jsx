/* global PUBLIC */
/*
 * Main page to hold results from query.  This could be
 * a simple table or a table of tables.
 */
import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import Typography from '@material-ui/core/Typography';
import Fade from '@material-ui/core/Fade';
import CircularProgress from '@material-ui/core/CircularProgress';
import { withStyles } from '@material-ui/core/styles';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Icon from '@material-ui/core/Icon';
import AppBar from '@material-ui/core/AppBar';

import { skeletonAddandOpen, skeletonRemove } from 'actions/skeleton';
import { neuroglancerAddandOpen } from 'actions/neuroglancer';
import { setFullScreen, clearFullScreen, setSelectedResult, launchNotification } from 'actions/app';
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

import './Results.css';

const styles = theme => ({
  root: {
    padding: theme.spacing.unit,
    outline: 0
  },
  full: {
    width: '100%',
    height: '100%',
    overflow: 'auto'
  },
  empty: {
    padding: theme.spacing.unit * 3
  },
  scroll: {
    overflow: 'auto',
    height: '100%'
  },
  fill: {
    height: '100%'
  }
});

class Results extends React.Component {
  componentDidMount() {
    // grab the contents of the search string.
    // if it has an array of query objects, fetch the data from neuPrint
    // and store it in the redux/local state?
    const { pluginList, actions } = this.props;
    const query = getQueryObject();
    const resultsList = query.qr || [];
    const tabValue = parseInt(query.tab || 0, 10);

    if (resultsList.length > 0) {
      const currentPlugin = pluginList.find(
        plugin => plugin.details.abbr === resultsList[tabValue].code
      );

      // only fetch results for the tab being displayed.
      actions.fetchData(resultsList[tabValue], currentPlugin, tabValue);
    }
  }

  componentDidUpdate(prevProps) {
    const { location, pluginList, actions } = this.props;
    // if the number of tabs has changed, then update the data.
    // if the current tab has changed, then update.
    // if the current page has changed, then update.
    if (location !== prevProps.location) {
      const query = getQueryObject();
      const resultsList = query.qr || [];
      const tabValue = parseInt(query.tab || 0, 10);

      if (resultsList.length > 0) {
        const currentPlugin = pluginList.find(
          plugin => plugin.details.abbr === resultsList[tabValue].code
        );
        actions.fetchData(resultsList[tabValue], currentPlugin, tabValue);
      }
    }
  }

  static getDerivedStateFromError(error) {
    return { loadingError: error };
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

  // TODO: fix the download button.
  downloadFile = index => {
    const { allResults } = this.props;
    const results = allResults.get(index);
    let csvData = `${results.result.columns.toString()}\n`;
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
    const element = document.createElement('a');
    const file = new Blob([csvData], { type: 'text/csv' });
    element.href = URL.createObjectURL(file);
    element.download = 'results.csv';
    element.click();
  };

  handleResultSelection = (event, value) => {
    // set the tabs value in the query string to the value
    // passed in here.
    setQueryString({ tab: value });
  };

  render() {
    // TODO: show query runtime results
    const {
      classes,
      isQuerying,
      loadingError,
      viewPlugins,
      allResults,
      actions,
      neoServer,
      pluginList,
      neo4jsettings
    } = this.props;

    const query = getQueryObject();
    const resultsList = query.qr || [];
    const tabValue = parseInt(query.tab || 0, 10);

    if (!isQuerying && resultsList.length === 0) {
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

    const resultTabs = resultsList.map(result => {
      const updated = result;
      updated.tabName = pluginList.find(
        plugin => plugin.details.abbr === result.code
      ).details.displayName;
      return updated;
    });

    const tabIndex = parseInt(query.tab || 0, 10);
    let tabData = (
      <div>
        <ResultsTopBar
          downloadCallback={this.downloadFile}
          name="Loading..."
          index={tabIndex}
          queryStr="Loading"
          color="#cccccc"
        />
        <div>Loading...</div>
      </div>
    );


    if (!isQuerying && allResults.get(tabValue)) {
      const currentPlugin = pluginList.find(
        plugin => plugin.details.abbr === resultsList[tabValue].code
      );

      const currentResult = currentPlugin.processResults(
        resultsList[tabValue],
        allResults.get(tabValue),
        actions,
        this.submit,
        PUBLIC // PUBLIC indicates this is a public version of the application
      );

      const combined = Object.assign(resultsList[tabValue], { result: currentResult });

      if (combined && combined.code === currentPlugin.details.abbr) {
        const View = viewPlugins.get(currentPlugin.details.visType);
        tabData = (
          <div className={classes.full}>
            <ResultsTopBar
              downloadCallback={this.downloadFile}
              name={combined.result.title}
              index={tabIndex}
              queryStr={combined.result.debug}
              color="#cccccc"
            />
            <View
              query={combined}
              index={tabIndex}
              actions={actions}
              neoServer={neoServer}
              neo4jsettings={neo4jsettings}
            />
          </div>
        );
      }
    }

    // Return here with a way to close the tab, if an error
    // occurred loading the data. Maybe add a try again button.

    if (!isQuerying && loadingError) {
      tabData = (
        <div className={classes.full}>
          <ResultsTopBar
            downloadCallback={this.downloadFile}
            name="Error loading content"
            index={tabIndex}
            queryStr="error"
            color="#ffcccc"
          />
          <div>{loadingError.toString()}</div>
        </div>
      );
    }


    const tabs = resultTabs.map((tab, index) => {
      const key = `${tab.code}${index}`;
      return <Tab key={key} label={tab.tabName} />;
    });

    return (
      <div className={classes.full}>
        <AppBar position="static" color="default">
          <Tabs
            value={tabValue}
            onChange={this.handleResultSelection}
            textColor="primary"
            indicatorColor="primary"
            variant="scrollable"
            scrollButtons="auto"
          >
            {tabs}
          </Tabs>
        </AppBar>
        <div className={classes.full}>
          <div className={classes.fill}>
            <div className={classes.scroll}>
              {tabData}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

Results.propTypes = {
  location: PropTypes.shape({
    search: PropTypes.string.isRequired
  }).isRequired,
  allResults: PropTypes.object.isRequired,
  pluginList: PropTypes.arrayOf(PropTypes.func).isRequired,
  viewPlugins: PropTypes.object.isRequired,
  loadingError: PropTypes.object,
  isQuerying: PropTypes.bool.isRequired,
  classes: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  neoServer: PropTypes.string.isRequired,
  neo4jsettings: PropTypes.object.isRequired
};

Results.defaultProps = {
  loadingError: null
};

// result data [{name: "table name", header: [headers...], body: [rows...]
const ResultsState = state => ({
  pluginList: state.app.get('pluginList'),
  isQuerying: state.results.get('loading'),
  loadingError: state.results.get('loadingError'),
  allResults: state.results.get('allResults'),
  viewPlugins: state.app.get('viewPlugins'),
  showSkel: state.skeleton.get('display'),
  userInfo: state.user.get('userInfo'),
  selectedResult: state.app.get('selectedResult'),
  queryObj: state.query.get('neoQueryObj'),
  fullscreen: state.app.get('fullscreen'),
  neo4jsettings: state.neo4jsettings,
  neoServer: state.neo4jsettings.get('neoServer')
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
    fetchData: (qParams, plugin, tabPosition) => {
      dispatch(fetchData(qParams, plugin, tabPosition));
    }
  }
});

export default withStyles(styles)(
  connect(
    ResultsState,
    ResultDispatch
  )(Results)
);
