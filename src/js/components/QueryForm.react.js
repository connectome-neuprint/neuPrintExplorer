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
      //redirectResults: false
    };
  }

  submitQuery = query => {
    if (this.props.userInfo === null || this.props.userInfo.AuthLevel === 'noauth') {
      this.setState({ openSnack: true });
      return;
    }
    if (query.queryStr === '') {
      return;
    }

    let currqs = qs.parse(this.props.urlQueryString);
    currqs['openQuery'] = 'false';
    let urlqs = qs.stringify(currqs);
    this.props.setURLQs(urlqs);

    this.props.history.push('/results' + window.location.search);

    // flush all other results
    query['isChild'] = false;
    this.props.updateQuery(query);
  };

  findCurrentPlugin = () => {
    // find matching query type
    var CurrentQuery = this.props.pluginList[0];
    for (var i in this.props.pluginList) {
      if (this.props.pluginList[i].queryName === this.props.queryType) {
        CurrentQuery = this.props.pluginList[i];
        break;
      }
    }
    return CurrentQuery;
  };

  handleClose = () => {
    this.setState({ openSnack: false });
  };

  render() {
    // assume the first query is the default
    var CurrentQuery = this.findCurrentPlugin();
    const { classes } = this.props;

    let currROIs = [];

    if (this.props.dataSet in this.props.availableROIs) {
      currROIs = this.props.availableROIs[this.props.dataSet];
    }

    return (
      <div>
        <Snackbar
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          open={this.state.openSnack}
          onClose={this.handleClose}
          SnackbarContentProps={{
            'aria-describedby': 'message-id'
          }}
          message={
            <span id="message-id">
              {this.props.userInfo === null
                ? 'User must log in'
                : 'User not authorized for this server (please contact admin)'}
            </span>
          }
        />
        <Typography>{CurrentQuery.queryDescription}</Typography>
        <Divider className={classes.divider} />
        <CurrentQuery
          datasetstr={this.props.datasetstr}
          dataSet={this.props.dataSet}
          availableROIs={currROIs}
          callback={this.submitQuery}
          disable={this.props.isQuerying}
        />
      </div>
    );
  }
}

QueryForm.defaultProps = {
  queryType: ''
};

QueryForm.propTypes = {
  queryType: PropTypes.string.isRequired,
  userInfo: PropTypes.object,
  updateQuery: PropTypes.func.isRequired,
  pluginList: PropTypes.array.isRequired,
  datasetstr: PropTypes.string.isRequired,
  dataSet: PropTypes.string.isRequired,
  isQuerying: PropTypes.bool.isRequired,
  classes: PropTypes.object.isRequired,
  setURLQs: PropTypes.func.isRequired,
  urlQueryString: PropTypes.string.isRequired,
  history: PropTypes.object.isRequired,
  neoResults: PropTypes.object,
  availableROIs: PropTypes.object.isRequired
};

var QueryFormState = function(state) {
  return {
    pluginList: state.app.get('pluginList'),
    isQuerying: state.query.isQuerying,
    neoResults: state.query.neoResults,
    neoError: state.query.neoError,
    userInfo: state.user.userInfo,
    urlQueryString: state.app.get('urlQueryString'),
    availableROIs: state.neo4jsettings.availableROIs
  };
};

var QueryFormDispatch = function(dispatch) {
  return {
    updateQuery: function(query) {
      dispatch({
        type: C.UPDATE_QUERY,
        neoQueryObj: query
      });
    },
    setURLQs: function(querystring) {
      dispatch(setUrlQS(querystring));
    }
  };
};

export default withRouter(
  withStyles(styles)(
    connect(
      QueryFormState,
      QueryFormDispatch
    )(QueryForm)
  )
);
