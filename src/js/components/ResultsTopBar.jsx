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
import ThreeDRotation from '@material-ui/icons/ThreeDRotation';
import Assignment from '@material-ui/icons/Assignment';

import { authError, reAuth } from 'actions/user';
import { launchNotification } from 'actions/app';
import { getQueryObject, setQueryString } from 'helpers/queryString';
import C from '../reducers/constants';

import CachedCounter from './ResultsTopBar/CachedCounter';
import AddIdModal from './ResultsTopBar/AddIdModal';
import CopyToClipboardModal from './ResultsTopBar/CopyToClipboardModal';

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
    right: theme.spacing(1),
    top: theme.spacing(1)
  },
  cachedTime: {
    color: '#555'
  }
});

class ResultsTopBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      addIdOpen: false,
      copyToClipboardOpen: false,
      bookmarkname: ''
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

  handleSaveResults = () => {
    // save the result data, cypher query and current time stamp
    // into google data store
    const { actions, token, appDB, queryStr, results, name, index } = this.props;
    const data = JSON.stringify(results.get(index));
    if (token !== '') {
      fetch(`${appDB}/user/searches`, {
        body: JSON.stringify({
          name,
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
        } else {
          actions.launchNotification('Results saved successfully');
        }
      });
    }
  };

  handleAddId = () => {
    this.setState({ addIdOpen: true });
  };

  handleCopyToClipboard = () => {
    this.setState({ copyToClipboardOpen: true });
  };

  handleRefresh = () => {
    const { actions, index } = this.props;
    actions.refreshResult(index);
  };

  handleRemoveResult = () => {
    const { actions, index, fixed } = this.props;
    // if fixed, just clear the ftab in the url and have the page close the split
    // window.
    if (fixed) {
      setQueryString({ ftab: '' });
      return;
    }

    // get query object
    const query = getQueryObject();
    // remove item from the list at position 'index';
    query.qr.splice(index, 1);
    // remove results for the current tab.
    actions.clearNewResult(index);

    // update the tab index in the query string so that we display
    // the tab before the one that was just removed.
    let tabIndex = query.tab > 0 ? query.tab - 1 : 0;
    // if window was split, then we show the other panel that we didn't close
    if (Number.isInteger(query.ftab) && query.ftab >= 0) {
      if (query.tab > query.ftab) {
        tabIndex = query.ftab;
      } else {
        tabIndex = query.ftab > 0 ? query.ftab - 1 : 0;
      }
    }
    setQueryString({ qr: query.qr, tab: tabIndex, ftab: '' });
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
        } else {
          actions.launchNotification('Favorite added successfully');
        }
      });
    }
  };

  render() {
    const {
      classes,
      color,
      name,
      index,
      downloadCallback,
      downloadEnabled,
      download3DCallback,
      clipboardCallback,
      saveEnabled,
      addIdEnabled,
      actions,
      fetchedTime,
      dataSet,
      visibleColumns,
      resultData
    } = this.props;
    const { open, addIdOpen, copyToClipboardOpen } = this.state;

    return (
      <div className={classNames(classes.root, 'topresultbar')} style={{ backgroundColor: color }}>
        <Toolbar>
          <Typography variant="caption" color="inherit" className={classes.flex} noWrap>
            {dataSet} - {name}
            <br />
            <span className={classes.cachedTime}>
              {' '}
              Loaded from server <CachedCounter fetchedTime={fetchedTime} key={index} /> ago{' '}
            </span>
          </Typography>
          <IconButton
            onClick={() => {
              actions.toggleCypherDisplay();
            }}
            aria-label="Show Query"
          >
            <Icon style={{ fontSize: 18 }}>info</Icon>
          </IconButton>

          {clipboardCallback && resultData && (
            <IconButton
              className={classes.button}
              aria-label="Copy results to clipboard"
              onClick={() => {
                this.handleCopyToClipboard();
              }}
            >
              <Assignment style={{ fontSize: 18 }} />
            </IconButton>
          )}
          {clipboardCallback && resultData && (
            <CopyToClipboardModal
              open={copyToClipboardOpen}
              visibleColumns={visibleColumns}
              resultData={resultData}
              callback={clipboardCallback}
              handleClose={() => this.setState({ copyToClipboardOpen: false })}
            />
          )}

          <IconButton aria-label="Refresh" onClick={this.handleRefresh}>
            <Icon style={{ fontSize: 18 }}>refresh</Icon>
          </IconButton>
          {addIdEnabled && (
            <IconButton aria-label="Add" onClick={this.handleAddId}>
              <Icon style={{ fontSize: 18 }}>add</Icon>
            </IconButton>
          )}
          <AddIdModal
            open={addIdOpen}
            index={index}
            handleClose={() => this.setState({ addIdOpen: false })}
          />

          {saveEnabled && (
            <IconButton aria-label="Add favorite" onClick={this.openPopup}>
              <Icon style={{ fontSize: 18 }}>star</Icon>
            </IconButton>
          )}

          {saveEnabled && (
            <IconButton
              className={classes.button}
              aria-label="Save"
              onClick={() => {
                this.handleSaveResults(index);
              }}
            >
              <Icon style={{ fontSize: 18 }}>save</Icon>
            </IconButton>
          )}

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

          {download3DCallback && (
            <IconButton
              className={classes.button}
              aria-label="Download VR viewer seed"
              onClick={() => {
                download3DCallback(index);
              }}
            >
              <ThreeDRotation style={{ fontSize: 18 }} />
            </IconButton>
          )}

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
  isAdmin: state.user.get('userInfo').AuthLevel === 'admin',
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
    },
    refreshResult(index) {
      dispatch({
        type: C.REFRESH_RESULT,
        index
      });
    },
    toggleCypherDisplay() {
      dispatch({
        type: C.TOGGLE_CYPHER_DISPLAY
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
  download3DCallback: PropTypes.func,
  clipboardCallback: PropTypes.func,
  visibleColumns: PropTypes.object,
  resultData: PropTypes.object,
  addIdEnabled: PropTypes.bool,
  saveEnabled: PropTypes.bool.isRequired,
  queryStr: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  fetchedTime: PropTypes.number,
  index: PropTypes.number.isRequired,
  token: PropTypes.string.isRequired,
  appDB: PropTypes.string.isRequired,
  results: PropTypes.object.isRequired,
  fixed: PropTypes.bool.isRequired,
  dataSet: PropTypes.string
};

ResultsTopBar.defaultProps = {
  color: '#cccccc',
  dataSet: 'loading',
  fetchedTime: new Date().getTime(),
  addIdEnabled: false,
  download3DCallback: null,
  clipboardCallback: null,
  visibleColumns: null,
  resultData: null
};

export default withStyles(styles)(
  connect(ResultsTopBarState, ResultsTopBarDispatch)(ResultsTopBar)
);
