import React from 'react';
import PropTypes from 'prop-types';
import Drawer from '@material-ui/core/Drawer';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import { withStyles } from '@material-ui/core/styles';

const styles = () => ({
  drawer: {
    width: '455px',
    marginTop: '70px'
  },
  close: {
    float: 'right'
  }
});

function ActionDrawer(props) {
  const { open, showHandler, classes, bodies } = props;

  const bodyList = bodies.map(body => {
    const name = body.get('name');
    return <p>{name}</p>;
  });

  return (
    <Drawer open={open} onClose={showHandler} variant="persistent">
      <div className={classes.drawer}>
        <IconButton
          key="close"
          aria-label="Close"
          color="inherit"
          className={classes.close}
          onClick={showHandler}
        >
          <CloseIcon />
        </IconButton>
        <Typography variant="h5" gutterBottom>
          Skeleton Options
        </Typography>
        <Button color="primary" variant="outlined">Show all</Button>
        <Button color="primary" variant="outlined">Hide all</Button>
        <Divider />

        <p>List of Bodys</p>
        <ul>
          <li>Synapse menu in exapnder</li>
          <li>Download link</li>
          <li>Show/Hide option</li>
          <li>Change color</li>
          <li>Remove from the display</li>
        </ul>
        {bodyList}
      </div>
    </Drawer>
  );
}

ActionDrawer.propTypes = {
  open: PropTypes.bool.isRequired,
  showHandler: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired,
  bodies: PropTypes.object.isRequired
};

export default withStyles(styles)(ActionDrawer);
