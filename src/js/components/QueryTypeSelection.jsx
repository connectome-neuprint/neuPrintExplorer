import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import slug from 'slugg';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Icon from '@material-ui/core/Icon';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import Collapse from '@material-ui/core/Collapse';
import Divider from '@material-ui/core/Divider';
import { setQueryString } from '../helpers/queryString';
import toggleTab from '../actions/query';

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
    borderBottom: '1px solid #ccc'
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
  const { classes, pluginList, tabs, actions } = props;

  return (
    <div>
      <div className={classes.header}>
        <Typography variant="h5">Query Selection</Typography>
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
              <ListItemIcon>
                <Icon>arrow_forward</Icon>
              </ListItemIcon>
              <ListItemText primary={val.details.displayName} />
            </ListItem>
          ))}

        <ListItem className={classes.expander} button onClick={() => actions.toggleTab(0)}>
          <ListItemText primary="General" />
          {tabs.get(0) ? <ExpandLess /> : <ExpandMore />}
        </ListItem>
        <Collapse in={tabs.get(0)} timeout="auto" unmountOnExit>
          {pluginList
            .filter(plugin => plugin.details.category === undefined)
            .map(val => (
              <ListItem
                button
                key={`item-${slug(val.details.name)}`}
                onClick={event => handleClick(event, slug(val.details.name))}
              >
                <ListItemIcon>
                  <Icon>arrow_forward</Icon>
                </ListItemIcon>
                <ListItemText primary={val.details.displayName} />
              </ListItem>
            ))}
        </Collapse>

        <ListItem className={classes.expander} button onClick={() => actions.toggleTab(1)}>
          <ListItemText primary="Reconstruction Related" />
          {tabs.get(1) ? <ExpandLess /> : <ExpandMore />}
        </ListItem>
        <Collapse in={tabs.get(1)} timeout="auto" unmountOnExit>
          {pluginList
            .filter(plugin => plugin.details.category === 'recon')
            .map(val => (
              <ListItem
                button
                key={`item-${slug(val.details.name)}`}
                onClick={event => handleClick(event, slug(val.details.name))}
              >
                <ListItemIcon>
                  <Icon>arrow_forward</Icon>
                </ListItemIcon>
                <ListItemText primary={val.details.displayName} />
              </ListItem>
            ))}
        </Collapse>

        <ListItem className={classes.expander} button onClick={() => actions.toggleTab(2)}>
          <ListItemText primary="Visualization" />
          {tabs.get(2) ? <ExpandLess /> : <ExpandMore />}
        </ListItem>
        <Collapse in={tabs.get(2)} timeout="auto" unmountOnExit>
          {pluginList
            .filter(plugin => plugin.details.category === 'visualization')
            .map(val => (
              <ListItem
                button
                key={`item-${slug(val.details.name)}`}
                onClick={event => handleClick(event, slug(val.details.name))}
              >
                <ListItemIcon>
                  <Icon>arrow_forward</Icon>
                </ListItemIcon>
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
  tabs: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
  pluginList: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object])).isRequired
};

const QueryTypeState = state => ({
  pluginList: state.app.get('pluginList'),
  tabs: state.query.get('tabs')
});

const QueryTypeDispatch = dispatch => ({
  actions: {
    toggleTab: id => {
      dispatch(toggleTab(id));
    }
  }
});

export default withStyles(styles)(connect(QueryTypeState, QueryTypeDispatch)(QueryTypeSelection));
