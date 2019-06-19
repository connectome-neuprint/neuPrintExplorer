/*
 * Top bar for each query result.
 */

import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import Typography from '@material-ui/core/Typography';
import Icon from '@material-ui/core/Icon';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Toolbar from '@material-ui/core/Toolbar';
import { withStyles } from '@material-ui/core/styles';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Dialog from '@material-ui/core/Dialog';
import DialogContentText from '@material-ui/core/DialogContentText';
import CloseIcon from '@material-ui/icons/Close';

import { authError, reAuth } from 'actions/user';
import { launchNotification } from 'actions/app';
import { getQueryObject, setQueryString } from 'helpers/queryString';
import C from '../reducers/constants';

const styles = theme => ({
  root: {
    width: '100%',
    flexGrow: true
  },
  flex: {
    flex: 1
  },
  closeButton: {
    position: 'absolute',
    right: theme.spacing.unit,
    top: theme.spacing.unit
  }
});

class ResultsTopBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      bookmarkname: '',
      showQuery: false
    };
  }

  openPopup = () => {
    this.setState({ open: true, bookmarkname: '' });
  };

  handleClose = () => {
    this.setState({ open: false });
  };

  handleFullScreen = () => {
    setQueryString({ rt: 'full' });
  };

  handleSaveResults = index => {
    // save the result data, cypher query and current time stamp
    // into google data store
    const { actions, token, appDB, queryStr, results } = this.props;
    const data = JSON.stringify(results.get(index));
    if (token !== '') {
      fetch(`${appDB}/user/searches`, {
        body: JSON.stringify({
          name: 'test',
          data,
          cypher: queryStr,
          timestamp: new Date().getTime()
        }),
        headers: {
          Authorization: `Bearer ${token}`,
          'content-type': 'application/json'
        },
        method: 'POST'
      }).then(resp => {
        if (resp.status === 401) {
          // need to re-authenticate
          actions.reAuth();
          actions.authError('User must re-authenticate');
        }
        else {
          actions.launchNotification('Results saved successfully');
        }
      });
    }

  };

  handleRemoveResult = index => {
    const { actions } = this.props;
    // get query object
    const query = getQueryObject();
    // remove item from the list at position 'index';
    query.qr.splice(index, 1);
    // remove results for the current tab.
    actions.clearNewResult(query.tab);
    // update the tab index in the query string so that we display
    // the tab before the one that was just removed.
    const tabIndex = query.tab > 0 ? query.tab - 1 : 0;
    setQueryString({ qr: query.qr, tab: tabIndex });
  };

  addFavorite = () => {
    const { actions, token, appDB, queryStr } = this.props;
    const { bookmarkname } = this.state;
    if (token !== '') {
      const loc = window.location.pathname + window.location.search;
      this.setState({ open: false });

      fetch(`${appDB}/user/favorites`, {
        body: JSON.stringify({
          name: bookmarkname,
          url: loc,
          cypher: queryStr
        }),
        headers: {
          Authorization: `Bearer ${token}`,
          'content-type': 'application/json'
        },
        method: 'POST'
      }).then(resp => {
        if (resp.status === 401) {
          // need to re-authenticate
          actions.reAuth();
          actions.authError('User must re-authenticate');
        }
        else {
          actions.launchNotification('Favorite added successfully');
        }
      });
    }
  };

  render() {
    const { classes, color, name, index, queryStr, downloadCallback, downloadEnabled } = this.props;
    const { showQuery, open } = this.state;

    return (
      <div className={classNames(classes.root, 'topresultbar')} style={{ backgroundColor: color }}>
        <Toolbar>
          <Typography variant="caption" color="inherit" className={classes.flex} noWrap>
            {name}
          </Typography>
          <IconButton
            onClick={() => {
              this.setState({ showQuery: true });
            }}
            aria-label="Show Query"
          >
            <Icon style={{ fontSize: 18 }}>info</Icon>
          </IconButton>
          <Dialog
            open={showQuery}
            onClose={() => {
              this.setState({ showQuery: false });
            }}
            aria-labelledby="form-dialog-title"
          >
            <DialogTitle id="form-dialog-title">
              Neo4j Cypher Query
              <IconButton
                aria-label="Close"
                className={classes.closeButton}
                onClick={() => this.setState({ showQuery: false })}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent>
              <DialogContentText>{queryStr}</DialogContentText>
            </DialogContent>
          </Dialog>
          <IconButton aria-label="Add favorite" onClick={this.openPopup}>
            <Icon style={{ fontSize: 18 }}>star</Icon>
          </IconButton>
          <IconButton
            className={classes.button}
            aria-label="Save"
            onClick={() => {
              this.handleSaveResults(index);
            }}
          >
            <Icon style={{ fontSize: 18 }}>save</Icon>
          </IconButton>
          <Dialog open={open} onClose={this.handleClose} aria-labelledby="form-dialog-title">
            <DialogTitle id="form-dialog-title">Save Bookmark</DialogTitle>
            <DialogContent>
              <DialogContentText>Name and save a query.</DialogContentText>
              <TextField
                autoFocus
                margin="dense"
                id="name"
                label="bookmark name"
                fullWidth
                onChange={event => this.setState({ bookmarkname: event.target.value })}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={this.handleClose} color="primary">
                Cancel
              </Button>
              <Button onClick={this.addFavorite} color="primary">
                Save
              </Button>
            </DialogActions>
          </Dialog>
          {downloadEnabled && (
            <IconButton
              className={classes.button}
              aria-label="Download data"
              onClick={() => {
                downloadCallback(index);
              }}
            >
              <Icon style={{ fontSize: 18 }}>file_download</Icon>
            </IconButton>
          )}
          <IconButton
            className={classes.button}
            aria-label="Full Screen"
            onClick={() => {
              this.handleFullScreen(index);
            }}
          >
            <Icon style={{ fontSize: 18 }}>fullscreen</Icon>
          </IconButton>

          <IconButton
            className={classes.button}
            aria-label="Close Window"
            onClick={() => {
              this.handleRemoveResult(index);
            }}
          >
            <Icon style={{ fontSize: 18 }}>close</Icon>
          </IconButton>
        </Toolbar>
      </div>
    );
  }
}

const ResultsTopBarState = state => ({
  token: state.user.get('token'),
  results: state.results.get('allResults'),
  appDB: state.app.get('appDB')
});

const ResultsTopBarDispatch = dispatch => ({
  actions: {
    reAuth() {
      dispatch(reAuth());
    },
    authError(message) {
      dispatch(authError(message));
    },
    launchNotification(message) {
      dispatch(launchNotification(message));
    },
    clearNewResult(index) {
      dispatch({
        type: C.CLEAR_NEW_RESULT,
        index
      });
    }
  }
});

ResultsTopBar.propTypes = {
  classes: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
  color: PropTypes.string,
  downloadCallback: PropTypes.func.isRequired,
  downloadEnabled: PropTypes.bool.isRequired,
  queryStr: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  token: PropTypes.string.isRequired,
  appDB: PropTypes.string.isRequired,
  results: PropTypes.object.isRequired
};

ResultsTopBar.defaultProps = {
  color: '#cccccc'
};

export default withStyles(styles)(
  connect(
    ResultsTopBarState,
    ResultsTopBarDispatch
  )(ResultsTopBar)
);
