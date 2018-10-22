import React from 'react';

import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Icon from '@material-ui/core/Icon';


const styles = theme => ({
  contact: {
    position: 'absolute',
    bottom: '1em',
    right: '1em',
  }
});


class Contact extends React.Component {
  render () {
    const { classes } = this.props;
    return (
      <Button className={classes.contact} color="primary" variant="fab" component="a" href="mailto:neuprint@hhmi.org">
        <Icon>contact_support</Icon>
      </Button>
    );
  }
}

export default withStyles(styles)(Contact);
