/*
 * Main page to hold results from query.  This could be
 * a simple table or a table of tables.
*/
import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import qs from 'qs';

import Typography from '@material-ui/core/Typography';
import Fade from '@material-ui/core/Fade';
import CircularProgress from '@material-ui/core/CircularProgress';
import { withStyles } from '@material-ui/core/styles';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Icon from '@material-ui/core/Icon';

import { toggleSkeleton } from 'actions/skeleton';
import { setFullScreen, clearFullScreen } from 'actions/app';
import ResultsTopBar from './ResultsTopBar';
import Skeleton from './Skeleton';
import NeuroGlancer from './NeuroGlancer';

import './Results.css';

const styles = theme => ({
  root: {
    padding: theme.spacing.unit,
    outline: 0
  },
  flex: {
    flex: 1
  },
  tablesDiv: {
    height: '80%'
  },
  full: {
    width: '100%',
    height: '100%',
    scroll: 'auto'
  },
  halftable: {
    width: '50%',
    height: '100%',
    float: 'left',
    scroll: 'auto'
  },
  halfskel: {
    width: '50%',
    height: '100%',
    float: 'right'
  },
  empty: {
    padding: theme.spacing.unit * 3
  },
  scroll: {
    overflow: 'auto',
    height: '100%'
  }
});

class Results extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedResult: 0
    };
  }

  componentDidMount() {
    document.addEventListener('keydown', this.triggerKeyboard);
  }

  componentDidUpdate(prevProps) {
    const { urlQueryString, showSkel } = this.props;
    const query = qs.parse(prevProps.urlQueryString);
    const query2 = qs.parse(urlQueryString);
    let openQuery = false;
    let openQuery2 = false;
    if ('openQuery' in query && query.openQuery === 'true') {
      openQuery = true;
    }
    if ('openQuery' in query2 && query2.openQuery === 'true') {
      openQuery2 = true;
    }

    if (prevProps.showSkel !== showSkel || openQuery !== openQuery2) {
      window.dispatchEvent(new Event('resize'));
    }
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.triggerKeyboard);
  }

  triggerKeyboard = event => {
    const { actions, skeletonCount } = this.props;
    const { hovered } = this.state;

    if (hovered) {
      if (event.which === 32) {
        if (skeletonCount > 0) {
          actions.toggleSkeleton();
        }
      } else if (event.which === 43) {
        if (skeletonCount > 0) {
          actions.setFullScreen('skeleton');
        }
      } else if (event.which === 95) {
        actions.clearFullScreen();
      }
    }
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
    this.setState({ selectedResult: value });
  };

  render() {
    // TODO: show query runtime results
    const { classes, isQuerying, allResults, viewPlugins, showSkel } = this.props;
    const { selectedResult } = this.state;

    if (!isQuerying && allResults.size === 0) {
      return (
        <div className={classes.root}>
          <div className={classes.empty}>
            <Typography variant="h6">No Search Results</Typography>
            <Typography>Please use the Menu to the left or the <Icon>search</Icon> icon to start a search.</Typography>
          </div>
        </div>
      );
    }

    // if the skeleton should be shown, add it to the results list.
    const combinedResults = (showSkel) ? allResults.push({
      neuronViz: true,
      plugin: 'NeuroGlancer',
      component: <NeuroGlancer />
    }).push({
      neuronViz: true,
      plugin: 'Skeleton',
      component: <Skeleton />
    }) : allResults;

    let results = '';

    if (combinedResults.size > 0) {
      results = combinedResults.slice(selectedResult, selectedResult + 1).map((query, index) => {
        if (query.neuronViz) {
          return query.component;
        }

        const View = viewPlugins.get(query.visType);
        const key = `${query.plugin}${index}`;
        return (
          <div key={key}>
            <ResultsTopBar
              downloadCallback={this.downloadFile}
              name={query.title}
              index={index}
              queryStr={query.result.debug}
              color={query.menuColor}
            />
            <View query={query} properties={query.visProps} />
          </div>
        );
      });
    }

    const tabs = combinedResults.map(query => ( <Tab label={query.plugin} /> ));

    return (
      <div>
        <Fade
          in={isQuerying}
          style={{
            transitionDelay: isQuerying ? '800ms' : '0ms'
          }}
          unmountOnExit
        >
          <CircularProgress />
        </Fade>

        <Tabs
          centered
          value={selectedResult}
          onChange={this.handleResultSelection}
          textColor="primary"
          indicatorColor="primary"
        >
          {tabs}
        </Tabs>
        <div className={classes.scroll}>
          {results}
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
  urlQueryString: PropTypes.string.isRequired,
  classes: PropTypes.object.isRequired,
  showSkel: PropTypes.bool.isRequired,
  skeletonCount: PropTypes.number.isRequired,
  actions: PropTypes.object.isRequired,
};

// result data [{name: "table name", header: [headers...], body: [rows...]
const ResultsState = state => ({
  isQuerying: state.query.isQuerying,
  neoError: state.query.neoError,
  allTables: state.results.allTables,
  allResults: state.results.allResults,
  viewPlugins: state.app.get('viewPlugins'),
  clearIndices: state.results.clearIndices,
  numClear: state.results.numClear,
  showSkel: state.skeleton.get('display'),
  skeletonCount: state.skeleton.get('neurons').size,
  userInfo: state.user.get('userInfo'),
  urlQueryString: state.app.get('urlQueryString'),
  queryObj: state.query.neoQueryObj,
  fullscreen: state.app.get('fullscreen')
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
    }
  }
});

export default withStyles(styles)(
  connect(
    ResultsState,
    ResultDispatch
  )(Results)
);
