import React from 'react';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';

const styles = () => ({
  roottext: {
    flex: 1
  }
});

function HelpDetails(props) {
  const { classes } = props;
  return (
    <div style={{ padding: 8 * 3, width: '100%' }}>
      <div className={classes.roottext}>
        <Typography>low-level technical details. neuprint paper link, how to download.</Typography>
      </div>
    </div>
  );
}

HelpDetails.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(HelpDetails);
