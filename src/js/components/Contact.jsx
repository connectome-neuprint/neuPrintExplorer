import React from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Icon from '@material-ui/core/Icon';
import { Link } from 'react-router-dom';


const styles = () => ({
  contact: {
    'z-index': 200,
    position: 'absolute',
    bottom: '1em',
    right: '1em',
  }
});


const Contact = ({ classes }) => (
  <Button className={classes.contact} color="primary" variant="fab" component={Link} to="/about">
    <Icon>contact_support</Icon>
  </Button>
);

Contact.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Contact);
