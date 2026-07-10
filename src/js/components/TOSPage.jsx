import React from 'react';
import PropTypes from 'prop-types';
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

function TOSPage({ classes, dataset, onAccept }) {
  return (
    <div className={classes.root}>
      <Paper className={classes.paper}>
        <Typography variant="h5" gutterBottom>
          Terms of Service Required
        </Typography>
        <Typography variant="body1" paragraph>
          Terms of Service required for {dataset}. Before you can access this service, you need to
          review and accept the Terms of Service. Click the button below to proceed.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          className={classes.button}
          onClick={onAccept}
        >
          Review Terms of Service
        </Button>
      </Paper>
    </div>
  );
}

TOSPage.propTypes = {
  classes: PropTypes.object.isRequired,
  dataset: PropTypes.string.isRequired,
  tosUrl: PropTypes.string,
  onAccept: PropTypes.func.isRequired
};

export default withStyles(styles)(TOSPage);
