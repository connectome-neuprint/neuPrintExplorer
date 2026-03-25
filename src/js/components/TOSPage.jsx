import React from 'react';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import withStyles from '@mui/styles/withStyles';

const styles = theme => ({
  root: {
    padding: theme.spacing(4),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  paper: {
    padding: theme.spacing(4),
    maxWidth: 600,
    textAlign: 'center'
  },
  button: {
    marginTop: theme.spacing(3)
  }
});

function TOSPage({ classes, location }) {
  const handleAccept = () => {
    const redirectUrl = encodeURIComponent(
      `${location.pathname}${location.search}`
    );
    window.open(`/login?redirect=${redirectUrl}`, '_self');
  };

  return (
    <div className={classes.root}>
      <Paper className={classes.paper}>
        <Typography variant="h5" gutterBottom>
          Terms of Service Required
        </Typography>
        <Typography variant="body1" paragraph>
          Before you can access this service, you need to review and accept the
          Terms of Service. Click the button below to proceed.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          className={classes.button}
          onClick={handleAccept}
        >
          Review Terms of Service
        </Button>
      </Paper>
    </div>
  );
}

export default withStyles(styles)(TOSPage);
