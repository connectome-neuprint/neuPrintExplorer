import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Avatar from '@mui/material/Avatar';
import Switch from '@mui/material/Switch';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import FormControlLabel from '@mui/material/FormControlLabel';
import withStyles from '@mui/styles/withStyles';

import C from '../reducers/constants';

function Account(props) {
  const { user, classes, setUserToken } = props;
  const [imgAvatar, setImageAvatar] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [rotating, setRotating] = useState(false);
  const [rotateError, setRotateError] = useState(null);
  const [rotated, setRotated] = useState(false);
  const token = user.get('token');

  const pinnedSkeleton = JSON.parse(localStorage.getItem('use_skeleton'));
  const [useSkeleton, setUseSkeleton] = useState(pinnedSkeleton);

  const handleSwitchChange = event => {
    setUseSkeleton(event.target.checked);
    if (event.target.checked) { // if the switch is on, set the value in local storage
      localStorage.setItem('use_skeleton', true);
    } else {
      localStorage.removeItem('use_skeleton');
    }
  }

  // Revoking replaces the token in one step: the server deletes the old one
  // and returns a new one. The old token is sent as the bearer so a forged
  // cross-site request cannot trigger a rotation.
  const handleRevoke = () => {
    setConfirmOpen(false);
    setRotating(true);
    setRotateError(null);
    setRotated(false);
    fetch('/token/rotate', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(result =>
        result
          .json()
          .catch(() => ({}))
          .then(data => ({ ok: result.ok, status: result.status, data }))
      )
      .then(({ ok, status, data }) => {
        if (!ok || !data.token) {
          throw new Error(data.message || data.detail || `Token revocation failed (status ${status}).`);
        }
        setUserToken(data.token);
        setRotated(true);
      })
      .catch(error => setRotateError(error.message))
      .finally(() => setRotating(false));
  };

  const avatar = imgAvatar ?  (
        <Avatar
          alt={user.get('userInfo').Email}
          src={user.get('userInfo').ImageURL}
          className={classes.avatar}
        /> ) : (
          <Avatar className={classes.avatar}>{user.get('userInfo').Email.charAt(0).toUpperCase()}</Avatar>
        );

  return (
    <div className={classes.root}>
      {/* This is a hidden image that is used to test if the avatar image will load correctly.
          If it doesn't, then the first letter of the user email is used. */}
      <img className={classes.hidden} src={user.get('userInfo').ImageURL} onError={() => setImageAvatar(false)} alt='' />
      <Typography variant="h3">Account</Typography>
      <Paper className={classes.account}>
        <Typography>You are logged in as:</Typography>
        <Typography>{user.get('userInfo').Email}</Typography>
        {avatar}
        <Typography>Authorization level:</Typography>
        <Typography>{user.get('userInfo').AuthLevel}</Typography>
      </Paper>
      <Paper className={classes.token}>
        <Typography>Auth Token:</Typography>
        <div className={classes.tokenRow}>
          <span className={classes.tokenText}>{token}</span>
          <Button
            variant="outlined"
            color="error"
            size="small"
            className={classes.revoke}
            disabled={!token || rotating}
            onClick={() => setConfirmOpen(true)}
          >
            {rotating ? 'Revoking…' : 'Revoke'}
          </Button>
        </div>
        {rotated ? (
          <Typography className={classes.tokenNote}>
            The old token was revoked. Update your scripts and config files with the new token above.
          </Typography>
        ) : null}
        {rotateError ? (
          <Typography color="error" className={classes.tokenNote}>
            {rotateError}
          </Typography>
        ) : null}
      </Paper>
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Revoke this token?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            A new token will be issued and shown here right away. Anything still using the old
            token (neuprint-python scripts, notebooks, config files, Clio and other tools) will
            stop working on every service within about 10 minutes.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button color="error" onClick={handleRevoke}>
            Revoke
          </Button>
        </DialogActions>
      </Dialog>
      <FormControlLabel
        control={
          <Switch
            checked={useSkeleton}
            onChange={handleSwitchChange}
            value="useSkeleton"
            color="primary"
          />
        }
        label="Restore Skeleton viewer as the default 3D viewer, instead of neuroglancer"
      />
    </div>
  );
}

Account.propTypes = {
  user: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
  setUserToken: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
  user: state.user
});

const mapDispatchToProps = dispatch => ({
  setUserToken(token) {
    dispatch({
      type: C.SET_USER_TOKEN,
      token
    });
  }
});

const styles = theme => ({
  root: {
    padding: theme.spacing(1)
  },
  avatar: {
    margin: 10
  },
  hidden: {
    display: 'none'
  },
  account: {
    padding: theme.spacing(2),
    marginBottom: theme.spacing(1)
  },
  token: {
    padding: theme.spacing(2),
    marginBottom: theme.spacing(1)
  },
  tokenRow: {
    display: 'flex',
    alignItems: 'center'
  },
  tokenText: {
    flex: 1,
    minWidth: 0,
    wordBreak: 'break-all'
  },
  revoke: {
    marginLeft: theme.spacing(2),
    flexShrink: 0
  },
  tokenNote: {
    marginTop: theme.spacing(1)
  }
});

export default withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(Account));
