import React from 'react';
import PropTypes from 'prop-types';
import Drawer from '@material-ui/core/Drawer';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import Icon from '@material-ui/core/Icon';
import CloseIcon from '@material-ui/icons/Close';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import DeleteIcon from '@material-ui/icons/Delete';
import { withStyles } from '@material-ui/core/styles';

const styles = () => ({
  drawer: {
    width: '455px',
    marginTop: '70px'
  },
  close: {
    float: 'right'
  },
  button: {
    margin: '0.3em 0 0.3em 0.5em'
  },
  colorBox: {
    height: '20px',
    width: '20px',
    border: '1px solid #ccc',
    padding: '1px'
  },
  notShown: {
    color: '#ccc'
  }
});

function ActionDrawer(props) {
  const { open, showHandler, bodyHideHandler, classes, bodies } = props;

  const bodyList = bodies
    .map(body => {
      const name = body.get('name');
      const colorBoxStyle = {
        backgroundColor: body.get('color')
      };
      const visible = body.get('visible', false) ? '' : classes.notShown;
      return (
        <React.Fragment key={name}>
          <ListItem>
            <ListItemText>
              <Button onClick={bodyHideHandler} className={visible}>{name}</Button>
            </ListItemText>
            <IconButton aria-label="Delete" className={classes.margin}>
              <div className={classes.colorBox} style={colorBoxStyle} />
            </IconButton>
            <IconButton aria-label="Delete" className={classes.margin}>
              <Icon style={{ fontSize: '1.5rem' }}>file_download</Icon>
            </IconButton>
            <IconButton aria-label="Delete" className={classes.margin}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </ListItem>
          <Divider />
        </React.Fragment>
      );
    })
    .valueSeq()
    .toArray();

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
        <Button className={classes.button} color="primary" variant="outlined">
          Show all
        </Button>
        <Button className={classes.button} color="primary" variant="outlined">
          Hide all
        </Button>
        <Typography variant="subtitle2">Click on a body id to toggle visibility</Typography>
        <Divider />
        <List>{bodyList}</List>
      </div>
    </Drawer>
  );
}

ActionDrawer.propTypes = {
  open: PropTypes.bool.isRequired,
  showHandler: PropTypes.func.isRequired,
  bodyHideHandler: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired,
  bodies: PropTypes.object.isRequired
};

export default withStyles(styles)(ActionDrawer);
