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
import Grid from '@material-ui/core/Grid';

import ResultsTopBar from './ResultsTopBar';
import SimpleTables from './SimpleTables';
import NeuronViz from './NeuronViz';
import { toggleSkeleton } from 'actions/skeleton';
import { setFullScreen, clearFullScreen } from 'actions/app';

import './Results.css';

var LightColors = [
  '#d9d9d9',
  '#8dd3c7',
  '#ffffb3',
  '#bebada',
  '#fb8072',
  '#80b1d3',
  '#fdb462',
  '#b3de69',
  '#fccde5'
];

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
  constructor(props, context) {
    super(props, context);
    this.state = {
      currLayout: null,
      selectedViewer: 1
    };
  }

  handleViewerSelect = (event, value) => {
    this.setState({ selectedViewer: value });
  };

  componentDidUpdate(prevProps, prevState) {
    let query = qs.parse(prevProps.urlQueryString);
    let query2 = qs.parse(this.props.urlQueryString);
    let openQuery = false;
    let openQuery2 = false;
    if ('openQuery' in query && query['openQuery'] === 'true') {
      openQuery = true;
    }
    if ('openQuery' in query2 && query2['openQuery'] === 'true') {
      openQuery2 = true;
    }

    if (prevProps.showSkel !== this.props.showSkel || openQuery !== openQuery2) {
      window.dispatchEvent(new Event('resize'));
    }
  }

  triggerKeyboard = event => {
    const { actions, skeletonCount } = this.props;
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
  };

  changeLayout = layout => {
    return;
  };

  downloadFile = index => {
    const { allResults } = this.props;
    const results = allResults.get(index);
    let csvData = results.result.columns.toString() + '\n';
    results.result.data.forEach(row => {
      const filteredRow = row.map(item => {
        if (item === null) return '';
        if (item.csvValue !== undefined) return item.csvValue;
        if (item.sortBy !== undefined) return item.sortBy;
        if (item.value !== undefined) return item.value;
        return item;
      });
      csvData += filteredRow.toString() + '\n';
    });
    const element = document.createElement('a');
    const file = new Blob([csvData], { type: 'text/csv' });
    element.href = URL.createObjectURL(file);
    element.download = 'results.csv';
    element.click();
  };

  render() {
    // TODO: show query runtime results
    const {
      classes,
      allTables,
      isQuerying,
      neoError,
      allResults,
      viewPlugins,
      showSkel,
      fullscreen
    } = this.props;
    let resArray = [];
    const gridWidth = showSkel ? 6 : 12;

    if (fullscreen && showSkel) {
      return (
        <div tabIndex="0" onKeyPress={this.triggerKeyboard} className={classes.full}>
          <NeuronViz />
        </div>
      );
    }

    if (neoError === null && allTables !== null) {
      allTables.forEach((result, index) => {
        //  TODO: rather than skip over the skeleton and place it in a
        //  different container system, why not add it to the grid layout
        //  and fix the dimensions / location. Search for
        //  'set layout properties directly on the children' @
        //  https://www.npmjs.com/package/react-grid-layout for an example.
        if (
          !this.props.clearIndices.has(index) &&
          (!('isSkeleton' in result[0]) || !result[0].isSkeleton)
        ) {
          let unId = `old${index}`;
          resArray.push(
            <div
              key={unId}
              data-grid={{
                x: 0,
                y: 0,
                w: gridWidth,
                h: 20
              }}
            >
              <ResultsTopBar
                downloadCallback={() => this.downloadFile()}
                name={result.length === 1 ? result[0].name : String(result.length) + ' tables'}
                queryStr={result[0].queryStr}
                index={index}
                color={LightColors[index % LightColors.length]}
              />
              <div className={classes.tablesDiv}>
                <SimpleTables allTables={result} />
              </div>
            </div>
          );
        }
      });
    }

    const results = allResults.map((query, index) => {
      const View = viewPlugins.get(query.visType);
      return (
        <div
          key={index}
          data-grid={{
            w: gridWidth,
            h: 20,
            x: 0,
            y: 0
          }}
        >
          <ResultsTopBar
            version={2}
            downloadCallback={this.downloadFile}
            name={query.title}
            index={index}
            queryStr={query.result.debug}
            color={query.menuColor}
          />
          <View query={query} key={index} properties={query.visProps} />
        </div>
      );
    });

    return (
      <div tabIndex="0" onKeyPress={this.triggerKeyboard} className={classes.root}>
        {!isQuerying &&
          resArray.length === 0 &&
          results.size === 0 && (
            <div className={classes.empty}>
              <Typography variant="h6">No Search Results</Typography>
              <Typography>Please use the Menu to the left to start a search.</Typography>
            </div>
          )}
        <Fade
          in={isQuerying}
          style={{
            transitionDelay: isQuerying ? '800ms' : '0ms'
          }}
          unmountOnExit
        >
          <CircularProgress />
        </Fade>
        <Grid container spacing={0}>
          <Grid item xs={12} sm={showSkel ? 6 : 12}>
            <div className={classes.scroll}>
              {results}
              {resArray.map(result => {
                return result;
              })}
            </div>
          </Grid>
          {showSkel ? (
            <Grid item xs={12} sm={6} h={2}>
              <NeuronViz />
            </Grid>
          ) : (
            <div />
          )}
        </Grid>
      </div>
    );
  }
}

Results.propTypes = {
  location: PropTypes.shape({
    search: PropTypes.string.isRequired
  }),
  allTables: PropTypes.array,
  allResults: PropTypes.object.isRequired,
  viewPlugins: PropTypes.object.isRequired,
  clearIndices: PropTypes.object,
  numClear: PropTypes.number,
  queryObj: PropTypes.object.isRequired,
  neoError: PropTypes.string,
  isQuerying: PropTypes.bool.isRequired,
  urlQueryString: PropTypes.string.isRequired,
  classes: PropTypes.object.isRequired,
  showSkel: PropTypes.bool.isRequired,
  skeletonCount: PropTypes.number.isRequired,
  userInfo: PropTypes.object,
  fullscreen: PropTypes.bool.isRequired
};

// result data [{name: "table name", header: [headers...], body: [rows...]
const ResultsState = function(state) {
  return {
    isQuerying: state.query.isQuerying,
    neoError: state.query.neoError,
    allTables: state.results.allTables,
    allResults: state.results.allResults,
    viewPlugins: state.app.get('viewPlugins'),
    clearIndices: state.results.clearIndices,
    numClear: state.results.numClear,
    showSkel: state.skeleton.get('display'),
    skeletonCount: state.skeleton.get('neurons').size,
    userInfo: state.user.userInfo,
    urlQueryString: state.app.get('urlQueryString'),
    queryObj: state.query.neoQueryObj,
    fullscreen: state.app.get('fullscreen')
  };
};

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
