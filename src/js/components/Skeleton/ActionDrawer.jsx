import React, { useReducer } from 'react';
import PropTypes from 'prop-types';
import Immutable from 'immutable';

import Drawer from '@mui/material/Drawer';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Icon from '@mui/material/Icon';
import CloseIcon from '@mui/icons-material/Close';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import DeleteIcon from '@mui/icons-material/Delete';
import Tooltip from '@mui/material/Tooltip';
import { withStyles } from '@material-ui/core/styles';

import ColorPickerModal from './ColorPickerModal';
import SynapseSelectionMenu from './SynapseSelectionMenu';

const styles = theme => ({
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
  },
  header: {
    paddingLeft: theme.spacing(2)
  }
});

const initialState = Immutable.Map({});

function reducer(state, action) {
  switch (action.type) {
    case 'addBody':
      return state.set(action.id, true);
    case 'removeBody':
      return state.delete(action.id);
    case 'updateBody': {
      if (action.status) {
        return state.set(action.id, true);
      }
      return state.delete(action.id);
    }
    default:
      return state;
  }
}

function ActionDrawer(props) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const {
    open,
    showAll,
    hideAll,
    showHandler,
    bodyHideHandler,
    bodyDeleteHandler,
    handleChangeColor,
    synapseRadius,
    classes,
    bodies
  } = props;

  const bodyList = bodies
    .map(body => {
      const name = body.get('name').toString();
      const dataSet = body.get('dataSet');
      const visible = body.get('visible', false) ? '' : classes.notShown;
      const swcDownload = `/api/skeletons/skeleton/${dataSet}/${name}?format=swc`;
      return (
        <React.Fragment key={name}>
          <ListItem>
            <ListItemText>
              <Button onClick={() => bodyHideHandler(name)} className={visible}>
                {name}
              </Button>
            </ListItemText>
            <ColorPickerModal
              bodyId={name}
              currentColor={body.get('color', '#aaa')}
              handleChangeColor={handleChangeColor}
            />
            <Tooltip title="Download" placement="top">
              <IconButton
                download
                href={swcDownload}
                aria-label="Download"
                className={classes.margin}
              >
                <Icon style={{ fontSize: '1.5rem' }}>file_download</Icon>
              </IconButton>
            </Tooltip>
            <Tooltip title="Synapse Selection" placement="top">
              <IconButton
                onClick={() => dispatch({ type: 'updateBody', id: name, status: !state.has(name) })}
                aria-label="Synapses"
                className={classes.margin}
              >
                <Icon style={{ fontSize: '1.5rem' }}>sync_alt</Icon>
              </IconButton>
            </Tooltip>
            <Tooltip title="Remove" placement="top">
              <IconButton
                onClick={() => bodyDeleteHandler(name)}
                aria-label="Delete"
                className={classes.margin}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </ListItem>
          <SynapseSelectionMenu
            open={state.has(name)}
            bodyId={name}
            dataSet={dataSet}
            synapseRadius={synapseRadius}
          />
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
        <Typography variant="h5" gutterBottom className={classes.header}>
          Skeleton Options
        </Typography>
        <Typography variant="subtitle2" className={classes.header}>
          Click on a body id to toggle visibility
        </Typography>

        <Button onClick={showAll} className={classes.button} color="primary" variant="outlined">
          Show all
        </Button>
        <Button onClick={hideAll} className={classes.button} color="primary" variant="outlined">
          Hide all
        </Button>
        <Divider />
        <List>{bodyList}</List>
      </div>
    </Drawer>
  );
}

ActionDrawer.propTypes = {
  open: PropTypes.bool.isRequired,
  showHandler: PropTypes.func.isRequired,
  showAll: PropTypes.func.isRequired,
  hideAll: PropTypes.func.isRequired,
  handleChangeColor: PropTypes.func.isRequired,
  bodyHideHandler: PropTypes.func.isRequired,
  bodyDeleteHandler: PropTypes.func.isRequired,
  synapseRadius: PropTypes.number.isRequired,
  classes: PropTypes.object.isRequired,
  bodies: PropTypes.object.isRequired
};

export default withStyles(styles)(ActionDrawer);
