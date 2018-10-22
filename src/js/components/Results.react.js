/*
 * Main page to hold results from query.  This could be
 * a simple table or a table of tables.
*/
import React from 'react';
import Typography from '@material-ui/core/Typography';
import Fade from '@material-ui/core/Fade';
import CircularProgress from '@material-ui/core/CircularProgress';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import _ from 'underscore';
import PropTypes from 'prop-types';
import qs from 'qs';
import { Responsive, WidthProvider } from 'react-grid-layout';
import Grid from '@material-ui/core/Grid';
import ResultsTopBar from './ResultsTopBar';
import SimpleTables from './SimpleTables';
import Skeleton from './Skeleton';

import './Results.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

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
    outline: 0,
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
    padding: theme.spacing.unit * 3,
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
      showSkel: false
    };
  }

  // if only query string has updated, prevent re-render
  shouldComponentUpdate(nextProps, nextState) {
    nextProps.location['search'] = this.props.location['search'];

    let numSkels = 0;
    if (this.props.allTables !== null) {
      this.props.allTables.forEach((result, index) => {
        if (
          !this.props.clearIndices.has(index) &&
          ('isSkeleton' in result[0] && result[0].isSkeleton)
        ) {
          numSkels += 1;
        }
      });
    }

    let numSkels2 = 0;
    if (nextProps.allTables !== null) {
      nextProps.allTables.forEach((result, index) => {
        if (
          !nextProps.clearIndices.has(index) &&
          ('isSkeleton' in result[0] && result[0].isSkeleton)
        ) {
          numSkels2 += 1;
        }
      });
    }

    // if the number of skeletons in the results tables has changed
    // then check to see if we are adding one and set showSkel in the
    // state to make sure we show it.
    if (numSkels2 !== numSkels) {
      if (numSkels2 > 0 && !nextState.showSkel) {
        this.setState({ showSkel: true });
      } else if (numSkels2 === 0) {
        this.setState({ showSkel: false });
      }
    }

    return !_.isEqual(nextProps, this.props) || !_.isEqual(nextState, this.state);
  }

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

    if (prevState.showSkel !== this.state.showSkel || openQuery !== openQuery2) {
      window.dispatchEvent(new Event('resize'));
    }
  }

  triggerKeyboard = event => {
    if (event.which === 32) {
      // check the mouse is over the skeleton div
      let numSkels = 0;
      if (this.props.allTables !== null) {
        this.props.allTables.forEach((result, index) => {
          if (
            !this.props.clearIndices.has(index) &&
            ('isSkeleton' in result[0] && result[0].isSkeleton)
          ) {
            numSkels += 1;
          }
        });
      }
      if (numSkels > 0) {
        this.setState({ showSkel: !this.state.showSkel });
      }
    }
  };

  changeLayout = layout => {
    let currIndex = 0;
    let tempLayout = {};
    this.props.allTables.forEach((result, index) => {
      if (!this.props.clearIndices.has(index)) {
        if (this.props.allTables.length - this.props.clearIndices.size > 1) {
          tempLayout[result[0].uniqueId * 2] = layout[currIndex];
        } else {
          tempLayout[result[0].uniqueId * 2 + 1] = layout[currIndex];
        }
        currIndex++;
      }
    });

    this.setState({ currLayout: tempLayout });
  };

  downloadFile = index => {
    if (
      'isSkeleton' in this.props.allTables[index][0] &&
      this.props.allTables[index][0].isSkeleton
    ) {
      let swcdata = '';
      let swc = this.props.allTables[index][0].swc;
      let ids = Object.keys(swc);
      ids.sort(function(a, b) {
        return parseInt(a) - parseInt(b);
      });
      for (let i = 0; i < ids.length; i++) {
        let row = swc[ids[i]];
        let currid = ids[i];
        swcdata += currid + ' ';
        swcdata += row.type.toString() + ' ';
        swcdata += row.x.toString() + ' ';
        swcdata += row.y.toString() + ' ';
        swcdata += row.z.toString() + ' ';
        swcdata += row.radius.toString() + ' ';
        swcdata += row.parent.toString() + '\n';
      }

      let element = document.createElement('a');
      let file = new Blob([swcdata], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = this.props.allTables[index][0].name + '.swc';
      element.click();
    } else {
      let csvdata = '';
      this.props.allTables[index].forEach(tableinfo => {
        // load one table -- fixed width

        // load table name
        var numelements = tableinfo.header.length;
        csvdata = csvdata + tableinfo.name + ',';
        for (var i = 1; i < numelements; i++) {
          csvdata = csvdata + ',';
        }
        csvdata = csvdata + '\n';

        // load headers
        tableinfo.header.forEach(headinfo => {
          csvdata = csvdata + headinfo.getValue() + ',';
        });
        csvdata = csvdata + '\n';

        // load data
        tableinfo.body.forEach(rowinfo => {
          rowinfo.forEach(elinfo => {
            csvdata = csvdata + elinfo.getValue() + ',';
          });
          csvdata = csvdata + '\n';
        });
      });

      let element = document.createElement('a');
      let file = new Blob([csvdata], { type: 'text/csv' });
      element.href = URL.createObjectURL(file);
      element.download = 'results.csv';
      element.click();
    }
  };

  render() {
    // TODO: show query runtime results
    const { classes, userInfo, allTables, isQuerying, neoError, allResults, viewPlugins } = this.props;
    let resArray = [];
    let currIndex = 0;
    let numTables = 0;

    if (allTables !== null) {
      allTables.forEach((result, index) => {
        if (
          !this.props.clearIndices.has(index) &&
          (!('isSkeleton' in result[0]) || !result[0].isSkeleton)
        ) {
          numTables += 1;
        }
      });
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
          let unId = this.state.showSkel
            ? result[0].uniqueId * 3 + 2
            : numTables > 1
              ? result[0].uniqueId * 3
              : result[0].uniqueId * 3 + 1;
          resArray.push(
            <div
              key={unId}
              data-grid={{
                x: (currIndex * 6) % 12,
                y: Math.floor(currIndex / 2) * 18,
                w: numTables > 1 ? 6 : 12,
                h: 20
              }}
            >
              <ResultsTopBar
                downloadCallback={this.downloadFile}
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
          currIndex += 1;
        }
      });
    }

    const results = allResults.map((query, index) => {
      const View = viewPlugins.get(query.visType);
      return (
        <div key={index}>
          <ResultsTopBar
            version={2}
            downloadCallback={this.downloadFile}
            name='Results'
            index={index}
            queryStr={query.result.debug}
            color={LightColors[index % LightColors.length]}
          />
          <View query={query} key={index} />
        </div>
      );
    });

    return (
      <div
        tabIndex="0"
        onKeyPress={this.triggerKeyboard}
        className={classes.root}
      >
        {results}
        {userInfo !== null && allTables !== null ? (
          <div/>
        ) : isQuerying ? (
          <Typography variant="h6">Querying...</Typography>
        ) : allTables !== null ? (
          <div />
        ) : (
          <div className={classes.empty}>
            <Typography variant="h6">No Search Results</Typography>
            <Typography>
              Please use the Menu to the left to start a search.
            </Typography>
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
        {neoError !== null ? (
          <Typography>Error: {neoError}</Typography>
        ) : resArray.length > 0 ? (
          <Grid container spacing={0}>
            <Grid item xs={12} sm={this.state.showSkel ? 6 : 12}>
              <div className={classes.scroll}>
                <ResponsiveGridLayout
                  className="layout"
                  rowHeight={30}
                  breakpoints={{ lg: 2000 }}
                  cols={{ lg: this.state.showSkel ? 6 : 12 }}
                  draggableHandle=".topresultbar"
                  compactType="vertical"
                  onResizeStop={this.changeLayout}
                >
                  {resArray.map(result => {
                    return result;
                  })}
                </ResponsiveGridLayout>
              </div>
            </Grid>
            {this.state.showSkel ? (
              <Grid item xs={12} sm={6}>
                <Skeleton disable={!this.state.showSkel} />
              </Grid>
            ) : (
              <div />
            )}
          </Grid>
        ) : (
          <div />
        )}
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
  userInfo: PropTypes.object
};

// result data [{name: "table name", header: [headers...], body: [rows...]
var ResultsState = function(state) {
  return {
    isQuerying: state.query.isQuerying,
    neoError: state.query.neoError,
    allTables: state.results.allTables,
    allResults: state.results.allResults,
    viewPlugins: state.app.get('viewPlugins'),
    clearIndices: state.results.clearIndices,
    numClear: state.results.numClear,
    userInfo: state.user.userInfo,
    urlQueryString: state.app.get('urlQueryString'),
    queryObj: state.query.neoQueryObj
  };
};

export default withStyles(styles)(
  connect(
    ResultsState,
    null
  )(Results)
);
