import React from 'react';
import PropTypes from 'prop-types';

import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import AppBar from '@material-ui/core/AppBar';
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

class Results extends React.Component {

  handleResultSelection = (event, value) => {
    // set the tabs value in the query string to the value
    // passed in here.
    setQueryString({ tab: value });
  };

  render() {
    const { allResults, pluginList, classes } = this.props;

    const query = getQueryObject();
    const resultsList = query.qr || [];
    const tabIndex = parseInt(query.tab || 0, 10);

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

    const tabData = [
      <Result tabIndex={tabIndex} query={query} />,
      <Result tabIndex={0} query={query} />
    ];

    return (
      <div className={classes.resultContent}>
        {query.rt !== 'full' && (
          <AppBar position="static" color="default">
            <Tabs
              value={tabIndex}
              onChange={this.handleResultSelection}
              textColor="primary"
              indicatorColor="primary"
              variant="scrollable"
              scrollButtons="auto"
            >
              {tabs}
            </Tabs>
          </AppBar>
        )}
        <div className={classes.scroll}>{tabData}</div>
      </div>
    );
  }
}

Results.propTypes = {
  allResults: PropTypes.object.isRequired,
  pluginList: PropTypes.arrayOf(PropTypes.func).isRequired,
  classes: PropTypes.object.isRequired
};

const ResultsState = state => ({
  pluginList: state.app.get('pluginList'),
  allResults: state.results.get('allResults')
});

const ResultsDispatch = () => ({});

export default withStyles(styles)(
  connect(
    ResultsState,
    ResultsDispatch
  )(Results)
);
