import React from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import Icon from '@material-ui/core/Icon';
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
    <IconButton className={classes.contact} color="primary" component={Link} to="/about">
      <Icon>contact_support</Icon>
    </IconButton>
  );
}

Contact.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Contact);
