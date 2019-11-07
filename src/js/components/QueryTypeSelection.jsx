import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import slug from 'slugg';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import Collapse from '@material-ui/core/Collapse';
import Divider from '@material-ui/core/Divider';
import { setQueryString } from '../helpers/queryString';

const styles = theme => ({
  root: {
    width: '100%',
    backgroundColor: theme.palette.background.paper,
    position: 'relative'
  },
  header: {
    margin: '1em 0 1em 1em'
  },
  listSection: {
    backgroundColor: 'inherit'
  },
  expander: {
    borderTop: '1px solid #ccc',
    borderBottom: '1px solid #ccc',
  },
  ul: {
    backgroundColor: 'inherit',
    padding: 0
  }
});

function handleClick(event, queryType) {
  setQueryString({ qt: queryType, q: 1 });
}

function QueryTypeSelection(props) {
  const { classes, pluginList } = props;
  const [open, setOpen] = React.useState(false);
  const [gopen, setGOpen] = React.useState(false);
  const [vopen, setVOpen] = React.useState(false);

  function handleExpand() {
    setOpen(!open);
  }

  return (
    <div>
      <div className={classes.header} >
      <Typography variant="h5" >
        Query Selection
      </Typography>
      <Typography variant="body1">Select a query from the choices below</Typography>
      </div>
      <Divider />
      <List className={classes.root} subheader={<li />}>
        {pluginList
          .filter(plugin => plugin.details.category === 'top-level')
          .map(val => (
            <ListItem
              button
              key={`item-${slug(val.details.name)}`}
              onClick={event => handleClick(event, slug(val.details.name))}
            >
              <ListItemText primary={val.details.displayName} />
            </ListItem>
          ))}
        <ListItem className={classes.expander} button onClick={() => setGOpen(!gopen)}>
          <ListItemText primary="General" />
          {gopen ? <ExpandLess /> : <ExpandMore />}
        </ListItem>
        <Collapse in={gopen} timeout="auto" unmountOnExit>
          {pluginList
            .filter(plugin => plugin.details.category === undefined)
            .map(val => (
              <ListItem
                button
                key={`item-${slug(val.details.name)}`}
                onClick={event => handleClick(event, slug(val.details.name))}
              >
                <ListItemText primary={val.details.displayName} />
              </ListItem>
            ))}
        </Collapse>
        <ListItem className={classes.expander} button onClick={handleExpand}>
          <ListItemText primary="Reconstruction Related" />
          {open ? <ExpandLess /> : <ExpandMore />}
        </ListItem>
        <Collapse in={open} timeout="auto" unmountOnExit>
          {pluginList
            .filter(plugin => plugin.details.category === 'recon')
            .map(val => (
              <ListItem
                button
                key={`item-${slug(val.details.name)}`}
                onClick={event => handleClick(event, slug(val.details.name))}
              >
                <ListItemText primary={val.details.displayName} />
              </ListItem>
            ))}
        </Collapse>
        <ListItem  className={classes.expander} button onClick={() => setVOpen(!vopen)}>
          <ListItemText primary="Visualization" />
          {vopen ? <ExpandLess /> : <ExpandMore />}
        </ListItem>
        <Collapse in={vopen} timeout="auto" unmountOnExit>
          {pluginList
            .filter(plugin => plugin.details.category === 'visualization')
            .map(val => (
              <ListItem
                button
                key={`item-${slug(val.details.name)}`}
                onClick={event => handleClick(event, slug(val.details.name))}
              >
                <ListItemText primary={val.details.displayName} />
              </ListItem>
            ))}
        </Collapse>
      </List>
    </div>
  );
}

QueryTypeSelection.propTypes = {
  classes: PropTypes.object.isRequired,
  pluginList: PropTypes.arrayOf(PropTypes.func).isRequired
};

const QueryTypeState = state => ({
  pluginList: state.app.get('pluginList')
});

export default withStyles(styles)(connect(QueryTypeState)(QueryTypeSelection));
