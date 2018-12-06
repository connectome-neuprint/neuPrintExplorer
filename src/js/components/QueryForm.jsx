/*
 * Query form that calls specific plugins for form input an doutput processing.
*/

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Snackbar from '@material-ui/core/Snackbar';
import { withRouter } from 'react-router-dom';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import { withStyles } from '@material-ui/core/styles';
import qs from 'qs';
import C from '../reducers/constants';
import { setUrlQS } from '../actions/app';

const styles = theme => ({
  divider: {
    marginTop: theme.spacing.unit,
    marginBottom: theme.spacing.unit
  }
});

class QueryForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      openSnack: false
      // redirectResults: false
    };
  }

  submitQuery = query => {
    const { userInfo, urlQueryString, history, setURLQs, updateQuery } = this.props;
    if (userInfo === null || userInfo.AuthLevel === 'noauth') {
      this.setState({ openSnack: true });
      return;
    }
    if (query.queryStr === '') {
      return;
    }

    const currqs = qs.parse(urlQueryString);
    currqs.openQuery = 'false';
    const urlqs = qs.stringify(currqs);
    setURLQs(urlqs);

    history.push(`/results${window.location.search}`);

    // flush all other results
    updateQuery(query);
  };

  findCurrentPlugin = () => {
    const { pluginList, queryType } = this.props;
    // find matching query type
    const CurrentQuery =
      pluginList.find(plugin => plugin.queryName === queryType) || pluginList[0];
    return CurrentQuery;
  };

  handleClose = () => {
    this.setState({ openSnack: false });
  };

  render() {
    // assume the first query is the default
    const CurrentQuery = this.findCurrentPlugin();
    const { userInfo, classes, dataSet, availableROIs, isQuerying } = this.props;
    const { openSnack } = this.state;
    let currROIs = [];

    if (dataSet in availableROIs) {
      currROIs = availableROIs[dataSet];
    }

    return (
      <div>
        <Snackbar
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          open={openSnack}
          onClose={this.handleClose}
          SnackbarContentProps={{
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
        <Typography>{CurrentQuery.queryDescription}</Typography>
        <Divider className={classes.divider} />
        <CurrentQuery
          datasetstr={dataSet}
          dataSet={dataSet}
          availableROIs={currROIs}
          callback={this.submitQuery}
          disable={isQuerying}
        />
      </div>
    );
  }
}

QueryForm.propTypes = {
  queryType: PropTypes.string.isRequired,
  userInfo: PropTypes.object.isRequired,
  updateQuery: PropTypes.func.isRequired,
  pluginList: PropTypes.arrayOf(PropTypes.func).isRequired,
  dataSet: PropTypes.string.isRequired,
  isQuerying: PropTypes.bool.isRequired,
  classes: PropTypes.object.isRequired,
  setURLQs: PropTypes.func.isRequired,
  urlQueryString: PropTypes.string.isRequired,
  history: PropTypes.object.isRequired,
  availableROIs: PropTypes.object.isRequired
};

const QueryFormState = state => ({
  pluginList: state.app.get('pluginList'),
  isQuerying: state.query.isQuerying,
  neoError: state.query.neoError,
  userInfo: state.user.get('userInfo'),
  urlQueryString: state.app.get('urlQueryString'),
  availableROIs: state.neo4jsettings.get('availableROIs')
});

const QueryFormDispatch = dispatch => ({
  updateQuery(query) {
    dispatch({
      type: C.UPDATE_QUERY,
      neoQueryObj: query
    });
  },
  setURLQs(querystring) {
    dispatch(setUrlQS(querystring));
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
