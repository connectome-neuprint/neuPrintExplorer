import React from 'react';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';
import { connect } from 'react-redux';

import withStyles from '@mui/styles/withStyles';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import AppBar from '@mui/material/AppBar';

import { getQueryObject, setQueryString } from 'helpers/queryString';
import Result from 'components/Result';

const styles = () => ({
  resultContent: {
    flex: 1,
    flexDirection: 'column',
    display: 'flex',
    overflow: 'hidden'
  },
  scroll: {
    overflow: 'auto',
    flex: 1,
    display: 'flex'
  }
});

function Results ({ allResults, pluginList, classes, authLevel, publicState, publicLoaded, columnDataLoaded, loggedIn }) {

  const handleResultSelection = (event, value) => {
    // set the tabs value in the query string to the value
    // passed in here.
    setQueryString({ tab: value });
  };

  if (!publicLoaded || !columnDataLoaded) {
    return (<p>loading...</p>);
  }

  if (!publicState) {
    // only redirect if the server is not in public read mode
    if (loggedIn && !authLevel.match(/^readwrite|admin$/)) {
      // only redirect if the user is logged in and their auth level
      // is not readwrite or admin.
      return (
        <Redirect
          to={{
            pathname: '/'
          }}
        />
      );
    }
  }

  const query = getQueryObject();
  const resultsList = query.qr || [];
  const tabIndex = parseInt(query.tab || 0, 10);
  const fixedTab = parseInt(query.ftab, 10);

  const tabs = resultsList.map((tab, index) => {
    const key = `${tab.code}${index}`;
    const tabResults = allResults.get(index);
    if (tabResults) {
      if (tabResults.label) {
        return <Tab key={key} label={tabResults.label} />;
      }
    }

    const selectedPlugin = pluginList.find(plugin => plugin.details.abbr === tab.code);

    if (selectedPlugin && selectedPlugin.details) {
      const tabName = selectedPlugin.details.displayName;
      return <Tab key={key} label={tabName} />;
    }
    return <Tab key={key} label="Unknown Plugin" />;
  });

  const tabData = [<Result key="changing" tabIndex={tabIndex} query={query} />];

  // need to check for >= 0 here instead of just checking the Boolean value,
  // because the first tab index is 0, which evaluates to false.
  if (fixedTab >= 0) {
    tabData.push(<Result key="fixed" tabIndex={fixedTab} query={query} fixed />);
  }

  return (
    <div className={classes.resultContent}>
      {query.rt !== 'full' && (
        <AppBar position="static" color="default">
          {tabs.length > 0 && (
            <Tabs
              value={tabIndex}
              onChange={handleResultSelection}
              textColor="primary"
              indicatorColor="primary"
              variant="scrollable"
              scrollButtons="auto"
            >
              {tabs}
            </Tabs>
          )}
        </AppBar>
      )}
      <div className={classes.scroll}>{tabData}</div>
    </div>
  );
}

Results.propTypes = {
  allResults: PropTypes.object.isRequired,
  pluginList: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object])).isRequired,
  classes: PropTypes.object.isRequired,
  authLevel: PropTypes.string.isRequired,
  loggedIn: PropTypes.bool.isRequired,
  publicState: PropTypes.bool.isRequired,
  publicLoaded: PropTypes.bool.isRequired,
  columnDataLoaded: PropTypes.bool.isRequired
};

const ResultsState = state => ({
  pluginList: state.app.get('pluginList'),
  allResults: state.results.get('allResults'),
  publicState: state.neo4jsettings.get('publicState'),
  publicLoaded: state.neo4jsettings.get('publicStateLoaded'),
  loggedIn: state.user.get('loggedIn'),
  columnDataLoaded: state.neo4jsettings.get('columnDefaultsLoaded'),
  authLevel: state.user.get('userInfo').AuthLevel || 'none'
});

const ResultsDispatch = () => ({});

export default withStyles(styles)(connect(ResultsState, ResultsDispatch)(Results));
