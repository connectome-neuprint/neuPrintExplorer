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

import { toggleSkeleton } from 'actions/skeleton';
import { setFullScreen, clearFullScreen, setSelectedResult } from 'actions/app';
import { metaInfoError } from '@neuprint/support';
import { updateQuery } from '../actions/plugins';

import ResultsTopBar from './ResultsTopBar';
import Skeleton from './Skeleton';
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
    const { actions } = this.props;
    actions.setSelectedResult(value);
  };

  render() {
    // TODO: show query runtime results
    const {
      classes,
      isQuerying,
      allResults,
      viewPlugins,
      showSkel,
      selectedResult,
      actions,
      neoServer
    } = this.props;

    if (!isQuerying && allResults.size === 0) {
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

    // if the skeleton should be shown, add it to the results list.
    const resultsWithViewers = showSkel
      ? allResults
          .push({
            neuronViz: true,
            plugin: 'Skeleton',
            component: <Skeleton key="skeleton" />
          })
          .push({
            neuronViz: true,
            plugin: 'NeuroGlancer',
            component: <NeuroGlancer key="ng" />
          })
      : allResults;

    let results = '';

    if (resultsWithViewers.size > 0) {
      const selectedIndex = !resultsWithViewers.get(selectedResult) ? 0 : selectedResult;
      const selectedQuery = resultsWithViewers.get(selectedIndex);
      if (selectedQuery.neuronViz) {
        results = selectedQuery.component;
      } else {
        const View = viewPlugins.get(selectedQuery.visType);
        results = (
          <div>
            <ResultsTopBar
              downloadCallback={this.downloadFile}
              name={selectedQuery.title}
              index={selectedIndex}
              queryStr={selectedQuery.result.debug}
              color={selectedQuery.menuColor}
            />
            <View
              query={selectedQuery}
              index={selectedIndex}
              actions={actions}
              neoServer={neoServer}
            />
          </div>
        );
      }
    }

    const tabs = resultsWithViewers.map((query, index) => {
      const key = `${query.plugin}${index}`;
      return <Tab key={key} label={query.plugin} />;
    });
    // when opening neuroglancer or skeleton viewer we set the selected index to -1 or -2.
    // This is not a valid option for the Tab component so we need to convert it to the
    // index in the array.
    let tabValue = selectedResult < 0 ? tabs.size + selectedResult : selectedResult;

    // if the tabValue is out of range, then just set it to the first tab.
    if (!tabs.get(tabValue)) {
      tabValue = 0;
    }

    return (
      <div className={classes.full}>
        <AppBar position="static" color="default">
          <Tabs
            value={tabValue}
            onChange={this.handleResultSelection}
            textColor="primary"
            indicatorColor="primary"
            scrollable
            scrollButtons="auto"
          >
            {tabs}
          </Tabs>
        </AppBar>
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
            {results}
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
  viewPlugins: PropTypes.object.isRequired,
  isQuerying: PropTypes.bool.isRequired,
  classes: PropTypes.object.isRequired,
  showSkel: PropTypes.bool.isRequired,
  actions: PropTypes.object.isRequired,
  selectedResult: PropTypes.number.isRequired,
  neoServer: PropTypes.string.isRequired
};

// result data [{name: "table name", header: [headers...], body: [rows...]
const ResultsState = state => ({
  isQuerying: state.query.get('isQuerying'),
  neoError: state.query.get('neoError'),
  allResults: state.results.get('allResults'),
  viewPlugins: state.app.get('viewPlugins'),
  showSkel: state.skeleton.get('display'),
  userInfo: state.user.get('userInfo'),
  selectedResult: state.app.get('selectedResult'),
  queryObj: state.query.get('neoQueryObj'),
  fullscreen: state.app.get('fullscreen'),
  neoServer: state.neo4jsettings.get('neoServer')
});

const ResultDispatch = dispatch => ({
  actions: {
    toggleSkeleton: () => {
      dispatch(toggleSkeleton());
    },
    setFullScreen: viewer => {
      dispatch(setFullScreen(viewer));
    },
    clearFullScreen: () => {
      dispatch(clearFullScreen());
    },
    setSelectedResult: index => {
      dispatch(setSelectedResult(index));
    },
    updateQuery: (index, newQueryObject) => {
      dispatch(updateQuery(index, newQueryObject));
    },
    metaInfoError: error => {
      dispatch(metaInfoError(error));
    }
  }
});

export default withStyles(styles)(
  connect(
    ResultsState,
    ResultDispatch
  )(Results)
);
