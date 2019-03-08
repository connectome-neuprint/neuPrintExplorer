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
import { setFullScreen, clearFullScreen, setSelectedResult, launchNotification } from 'actions/app';
import { metaInfoError } from '@neuprint/support';
import { pluginResponseError } from 'actions/plugins';

import {
  getQueryObject,
  setQueryString,
  updateResultInQueryString,
  getQueryString,
  setSearchQueryString
} from 'helpers/queryString';

import ResultsTopBar from './ResultsTopBar';
import NeuroGlancer from './NeuroGlancer';

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
  constructor(props) {
    super(props);
    this.state = {
      currentResult: null,
      loadingDisplay: false,
      loadingError: false
    };
  }

  componentDidMount() {
    // grab the contents of the search string.
    // if it has an array of query objects, fetch the data from neuPrint
    // and store it in the redux/local state?
    const { pluginList } = this.props;
    const query = getQueryObject();
    const resultsList = query.qr || [];
    const tabValue = parseInt(query.tab || 0, 10);

    if (resultsList.length > 0) {
      const currentPlugin = pluginList.find(
        plugin => plugin.details.abbr === resultsList[tabValue].code
      );

      // only fetch results for the tab being displayed.
      this.fetchData(resultsList[tabValue], currentPlugin);
    }
  }

  componentDidUpdate(prevProps) {
    const { location, pluginList } = this.props;
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
        this.fetchData(resultsList[tabValue], currentPlugin);
      }
    }
  }

  submit = query => {
    const { history } = this.props;
    // TODO: set query as a tab in the url query string.
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

  fetchData(qParams, plugin) {
    const { actions } = this.props;
    const { pm: parameters } = qParams;
    if (!plugin) {
      return;
    }

    this.setState({
      loadingDisplay: true,
      currentResult: null,
      loadingError: null
    });

    // TODO: we should be able to generate the cypher query by calling a function
    // from the plugin, for all plugins apart from the custom query plugin.
    //
    const fetchParams = plugin.fetchParameters(parameters);
    // build the query url. Use the custom one by default.
    let queryUrl = '/api/custom/custom';
    if (fetchParams.queryString) {
      queryUrl = `/api${fetchParams.queryString}`;
    }

    // if cypherQuery is passed in, then add it to the parameters.
    if (parameters.cypherQuery) {
      parameters.cypher = parameters.cypherQuery;
    } else if (fetchParams.cypherQuery) {
      parameters.cypher = fetchParams.cypherQuery;
    }
    // Some plugins have nothing to fetch. In that case we can skip the remote fetch
    // and just return the query.
    if (parameters.skip) {
      const data = plugin.processResults(qParams);
      const combined = Object.assign(qParams, { result: data });
      this.setState({
        currentResult: combined,
        loadingDisplay: false
      });
      return;
    }

    fetch(queryUrl, {
      headers: {
        'content-type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify(parameters),
      method: 'POST',
      credentials: 'include'
    })
      .then(result => result.json())
      .then(resp => {
        // sends error message provided by neuprinthttp
        if (resp.error) {
          throw new Error(resp.error);
        }
        // make new result object
        const data = plugin.processResults(qParams, resp, actions, this.submit);
        const combined = Object.assign(qParams, { result: data });
        this.setState({
          currentResult: combined,
          loadingDisplay: false
        });
      })
      .catch(error => {
        this.setState({
          loadingError: error,
          loadingDisplay: false,
          currentResult: null
        });
      });
  }

  render() {
    // TODO: show query runtime results
    const {
      classes,
      isQuerying,
      viewPlugins,
      actions,
      neoServer,
      pluginList,
      neo4jsettings
    } = this.props;

    const { currentResult, loadingDisplay, loadingError } = this.state;

    const query = getQueryObject();
    const resultsList = query.qr || [];

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

    const tabValue = parseInt(query.tab || 0, 10);
    const currentPlugin = pluginList.find(
      plugin => plugin.details.abbr === resultsList[tabValue].code
    );
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

    if (!loadingDisplay && currentResult && currentResult.code === currentPlugin.details.abbr) {
      const View = viewPlugins.get(currentPlugin.details.visType);
      tabData = (
        <div className={classes.full}>
          <ResultsTopBar
            downloadCallback={this.downloadFile}
            name={currentResult.result.title}
            index={tabIndex}
            queryStr={currentResult.result.debug}
            color="#cccccc"
          />
          <View query={currentResult} index={tabIndex} actions={actions} neoServer={neoServer} neo4jsettings={neo4jsettings}/>
        </div>
      );
    }

    if (!loadingDisplay && loadingError) {
      tabData = (
        <ResultsTopBar
          downloadCallback={this.downloadFile}
          name="Error loading content"
          index={tabIndex}
          queryStr="error"
          color="#ffcccc"
        />
      );
    }

    // TODO: add return here with a way to close the tab, if an error
    // occurred loading the data. Maybe add a try again button.

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
              <Fade
                in={isQuerying}
                style={{
                  transitionDelay: isQuerying ? '800ms' : '0ms'
                }}
                unmountOnExit
              >
                <CircularProgress />
              </Fade>
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
  isQuerying: PropTypes.bool.isRequired,
  classes: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  neoServer: PropTypes.string.isRequired,
  neo4jsettings: PropTypes.object.isRequired
};

// result data [{name: "table name", header: [headers...], body: [rows...]
const ResultsState = state => ({
  pluginList: state.app.get('pluginList'),
  isQuerying: state.query.get('isQuerying'),
  neoError: state.query.get('neoError'),
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
    skeletonRemove: (id, dataSet) => {
      dispatch(skeletonRemove(id, dataSet));
    },
    getQueryObject: (id, empty) => getQueryObject(id, empty),
    setQueryString: (data) => setQueryString(data)
  }
});

export default withStyles(styles)(
  connect(
    ResultsState,
    ResultDispatch
  )(Results)
);
