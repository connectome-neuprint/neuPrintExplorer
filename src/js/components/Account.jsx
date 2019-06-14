import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import { withStyles } from '@material-ui/core/styles';

function Account(props) {
  const { user, classes } = props;
  return (
    <div className={classes.root}>
      <Typography>User account for {user.get('userInfo').Email}</Typography>
      <Typography>Auth Token:</Typography>
      <Paper className={classes.token}>{user.get('token')}</Paper>
    </div>
  );
}

Account.propTypes = {
  user: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
  user: state.user
});

const styles = theme => ({
  root: {
    padding: `${theme.spacing.unit}px`
  },
  token: {
    padding:  `${theme.spacing.unit * 2}px`,
    wordBreak: 'break-all'
  }
});

export default withStyles(styles)(connect(mapStateToProps)(Account));
