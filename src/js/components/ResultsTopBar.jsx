/*
 * Top bar for each query result.
 */

import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useResizeDetector } from 'react-resize-detector';

import Typography from '@material-ui/core/Typography';
import Icon from '@material-ui/core/Icon';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Toolbar from '@material-ui/core/Toolbar';
import Tooltip from '@material-ui/core/Tooltip';
import { withStyles } from '@material-ui/core/styles';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Dialog from '@material-ui/core/Dialog';
import DialogContentText from '@material-ui/core/DialogContentText';
import ThreeDRotation from '@material-ui/icons/ThreeDRotation';
import Assignment from '@material-ui/icons/Assignment';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

import { authError, reAuth } from 'actions/user';
import { launchNotification } from 'actions/app';
import { getQueryObject, setQueryString } from 'helpers/queryString';
import C from '../reducers/constants';

import CachedCounter from './ResultsTopBar/CachedCounter';
import AddIdModal from './ResultsTopBar/AddIdModal';
import CopyToClipboardModal from './ResultsTopBar/CopyToClipboardModal';

const styles = (theme) => ({
  root: {
    width: '100%',
    flexGrow: true,
  },
  flex: {
    flex: 1,
  },
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
  },
  cachedTime: {
    color: '#555',
  },
  menuIcon: {
    fontSize: 18,
    marginRight: theme.spacing(2),
  },
});

function ResultsTopBar({
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
  resultData,
  token,
  appDB,
  queryStr,
  results,
  fixed,
  onClose,
}) {
  const [open, setOpen] = React.useState(false);
  const [addIdOpen, setAddIdOpen] = React.useState(false);
  const [copyToClipboardOpen, setCopyToClipboardOpen] = React.useState(false);
  const [bookmarkname, setBookmarkname] = React.useState('');
  const [anchorEl, setAnchorEl] = React.useState(null);
  const { width, ref } = useResizeDetector();


  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const openPopup = () => {
    setOpen(true);
    setBookmarkname('');
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSaveResults = () => {
    // save the result data, cypher query and current time stamp
    // into google data store
    const data = JSON.stringify(results.get(index));
    if (token !== '') {
      fetch(`${appDB}/user/searches`, {
        body: JSON.stringify({
          name,
          data,
          cypher: queryStr,
          timestamp: new Date().getTime(),
        }),
        headers: {
          Authorization: `Bearer ${token}`,
          'content-type': 'application/json',
        },
        method: 'POST',
      }).then((resp) => {
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

  const handleAddId = () => {
    setAddIdOpen(true);
  };

  const handleCopyToClipboard = () => {
    setCopyToClipboardOpen(true);
  };

  const handleRefresh = () => {
    actions.refreshResult(index);
  };

  const handleRemoveResult = () => {
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

  const addFavorite = () => {
    if (token !== '') {
      const loc = window.location.pathname + window.location.search;
      setOpen(false);

      fetch(`${appDB}/user/favorites`, {
        body: JSON.stringify({
          name: bookmarkname,
          url: loc,
          cypher: queryStr,
        }),
        headers: {
          Authorization: `Bearer ${token}`,
          'content-type': 'application/json',
        },
        method: 'POST',
      }).then((resp) => {
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

  return (
    <div ref={ref} className={classNames(classes.root, 'topresultbar')} style={{ backgroundColor: color }}>
      <Toolbar>
        <Typography variant="caption" color="inherit" className={classes.flex} noWrap>
          {dataSet} - {name}
          <br />{' '}
          {dataSet !== 'loading' ? (
            <span className={classes.cachedTime}>
              Loaded from server <CachedCounter fetchedTime={fetchedTime} key={index} /> ago
            </span>
          ) : (
            ''
          )}
        </Typography>
        {width > 550 ? (
          <>
            <Tooltip title="Show Cypher Query">
              <IconButton
                onClick={() => {
                  actions.toggleCypherDisplay();
                }}
                aria-label="Show Query"
              >
                <Icon style={{ fontSize: 18 }}>info</Icon>
              </IconButton>
            </Tooltip>

            {clipboardCallback && resultData && (
              <Tooltip title="Copy to clipboard">
                <IconButton
                  className={classes.button}
                  aria-label="Copy results to clipboard"
                  onClick={() => {
                    handleCopyToClipboard();
                  }}
                >
                  <Assignment style={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title="reload results">
              <IconButton aria-label="Refresh" onClick={handleRefresh}>
                <Icon style={{ fontSize: 18 }}>refresh</Icon>
              </IconButton>
            </Tooltip>
            {addIdEnabled && (
              <Tooltip title="Add body id">
                <IconButton aria-label="Add" onClick={handleAddId}>
                  <Icon style={{ fontSize: 18 }}>add</Icon>
                </IconButton>
              </Tooltip>
            )}
            {saveEnabled && (
              <Tooltip title="Add to favorites">
                <IconButton aria-label="Add favorite" onClick={openPopup}>
                  <Icon style={{ fontSize: 18 }}>star</Icon>
                </IconButton>
              </Tooltip>
            )}

            {saveEnabled && (
              <Tooltip title="Add to saved searches">
                <IconButton
                  className={classes.button}
                  aria-label="Save"
                  onClick={() => {
                    handleSaveResults(index);
                  }}
                >
                  <Icon style={{ fontSize: 18 }}>save</Icon>
                </IconButton>
              </Tooltip>
            )}

            {downloadEnabled && (
              <Tooltip title="Download results">
                <IconButton
                  className={classes.button}
                  aria-label="Download data"
                  onClick={() => {
                    downloadCallback(index);
                  }}
                >
                  <Icon style={{ fontSize: 18 }}>file_download</Icon>
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title="Fullscreen">
              <IconButton
                className={classes.button}
                aria-label="Full Screen"
                onClick={() => setQueryString({ rt: 'full' })}
              >
                <Icon style={{ fontSize: 18 }}>fullscreen</Icon>
              </IconButton>
            </Tooltip>

            {download3DCallback && (
              <Tooltip title="Download VR viewer seed">
                <IconButton
                  className={classes.button}
                  aria-label="Download VR viewer seed"
                  onClick={() => {
                    download3DCallback(index);
                  }}
                >
                  <ThreeDRotation style={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
            )}
          </>
        ) : (
          <>
            <IconButton
              color="inherit"
              aria-label="menu"
              className={classes.button}
              onClick={handleOpenMenu}
            >
              <Icon style={{ fontSize: 18 }}>menu</Icon>
            </IconButton>
            <Menu
              id="simple-menu"
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleCloseMenu}
            >
              <MenuItem
                onClick={() => {
                  actions.toggleCypherDisplay();
                }}
              >
                <Icon className={classes.menuIcon}>info</Icon> Show Cypher Query
              </MenuItem>
              {clipboardCallback && resultData && (
                <MenuItem
                  aria-label="Copy results to clipboard"
                  onClick={() => {
                    handleCopyToClipboard();
                  }}
                >
                  <Assignment className={classes.menuIcon} /> Copy to clipboard
                </MenuItem>
              )}

              <MenuItem aria-label="Refresh" onClick={handleRefresh}>
                <Icon className={classes.menuIcon}>refresh</Icon> Refresh
              </MenuItem>
              {addIdEnabled && (
                <MenuItem aria-label="Add" onClick={handleAddId}>
                  <Icon className={classes.menuIcon}>add</Icon> Add body id
                </MenuItem>
              )}

              {saveEnabled && (
                <MenuItem aria-label="Add favorite" onClick={openPopup}>
                  <Icon className={classes.menuIcon}>star</Icon> Add to favorites
                </MenuItem>
              )}

              {saveEnabled && (
                <MenuItem
                  aria-label="Save"
                  onClick={() => {
                    handleSaveResults(index);
                  }}
                >
                  <Icon className={classes.menuIcon}>save</Icon> Add to saved searches
                </MenuItem>
              )}
              {downloadEnabled && (
                <MenuItem
                  aria-label="Download data"
                  onClick={() => {
                    downloadCallback(index);
                  }}
                >
                  <Icon className={classes.menuIcon}>file_download</Icon> Download results
                </MenuItem>
              )}

              <MenuItem onClick={() => setQueryString({ rt: 'full' })}>
                <Icon className={classes.menuIcon}>fullscreen</Icon>
                Full screen
              </MenuItem>
              {download3DCallback && (
                <MenuItem onClick={() => download3DCallback(index)}>
                  <ThreeDRotation className={classes.menuIcon} /> Download VR viewer Seed
                </MenuItem>
              )}
            </Menu>
          </>
        )}

        <Tooltip title="Close tab">
          <IconButton
            className={classes.button}
            aria-label="Close tab"
            onClick={() => {
              handleRemoveResult(index);
              if (onClose) {
                onClose();
              }
            }}
          >
            <Icon style={{ fontSize: 18 }}>close</Icon>
          </IconButton>
        </Tooltip>
      </Toolbar>
      <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Save Bookmark</DialogTitle>
        <DialogContent>
          <DialogContentText>Name and save a query.</DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="bookmark name"
            fullWidth
            onChange={(event) => setBookmarkname(event.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={addFavorite} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <AddIdModal open={addIdOpen} index={index} handleClose={() => setAddIdOpen(false)} />
      {clipboardCallback && resultData && (
        <CopyToClipboardModal
          open={copyToClipboardOpen}
          visibleColumns={visibleColumns}
          resultData={resultData}
          callback={clipboardCallback}
          handleClose={() => setCopyToClipboardOpen(false)}
        />
      )}
    </div>
  );
}

const ResultsTopBarState = (state) => ({
  token: state.user.get('token'),
  isAdmin: state.user.get('userInfo').AuthLevel === 'admin',
  results: state.results.get('allResults'),
  appDB: state.app.get('appDB'),
});

const ResultsTopBarDispatch = (dispatch) => ({
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
        index,
      });
    },
    refreshResult(index) {
      dispatch({
        type: C.REFRESH_RESULT,
        index,
      });
    },
    toggleCypherDisplay() {
      dispatch({
        type: C.TOGGLE_CYPHER_DISPLAY,
      });
    },
  },
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
  dataSet: PropTypes.string,
  onClose: PropTypes.func,
};

ResultsTopBar.defaultProps = {
  color: '#cccccc',
  dataSet: 'loading',
  fetchedTime: new Date().getTime(),
  addIdEnabled: false,
  download3DCallback: null,
  clipboardCallback: null,
  visibleColumns: null,
  resultData: null,
  onClose: null,
};

export default withStyles(styles)(
  connect(ResultsTopBarState, ResultsTopBarDispatch)(ResultsTopBar)
);
