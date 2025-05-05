import React from 'react';
import PropTypes from 'prop-types';

import withStyles from '@mui/styles/withStyles';
import IconButton from '@mui/material/IconButton';
import Icon from '@mui/material/Icon';
import { Link } from 'react-router-dom';


const styles = () => ({
  contact: {
    'z-index': 200,
    position: 'absolute',
    bottom: '1em',
  }
});


function Contact({ classes }) {
  return (
    <IconButton
      className={classes.contact}
      color="primary"
      component={Link}
      to="/about"
      size="large">
      <Icon>contact_support</Icon>
    </IconButton>
  );
}

Contact.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Contact);
