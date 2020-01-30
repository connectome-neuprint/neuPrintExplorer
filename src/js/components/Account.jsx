import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Avatar from '@material-ui/core/Avatar';
import { withStyles } from '@material-ui/core/styles';

function Account(props) {
  const { user, classes } = props;
  const [imgAvatar, setImageAvatar] = useState(true);

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
        {user.get('token')}
      </Paper>
    </div>
  );
}

Account.propTypes = {
  user: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  user: state.user
});

const styles = theme => ({
  root: {
    padding: `${theme.spacing.unit}px`
  },
  avatar: {
    margin: 10
  },
  hidden: {
    display: 'none'
  },
  account: {
    padding: `${theme.spacing.unit * 2}px`,
    marginBottom: `${theme.spacing.unit}px`
  },
  token: {
    padding: `${theme.spacing.unit * 2}px`,
    wordBreak: 'break-all'
  }
});

export default withStyles(styles)(connect(mapStateToProps)(Account));
