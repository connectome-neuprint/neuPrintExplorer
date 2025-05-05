import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';

import NodeTable from './ObjectsView/NodeTable';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
  },
  clickable: {
    textDecoration: 'underline',
    color: theme.palette.primary.main,
    cursor: 'pointer',
  },
  scroll: {
    marginTop: theme.spacing(1),
    overflowY: 'auto',
    overflowX: 'auto',
  },
}));

function a11yProps(index) {
  return {
    id: `objectview-tab-${index}`,
    'aria-controls': `objectview-tabpanel-${index}`,
  };
}

export default function ObjectsView({ query }) {
  const classes = useStyles();
  const [tabIndex, setTabIndex] = useState(0);
  const { result } = query;

  const handleChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  const tabs = [];
  const tabContents = [];

  const objectTypes = ['mitochondrion', 'pre', 'post'];

  objectTypes.filter(type => result.data[type]).forEach(type => {
    const label = type === 'mitochondrion' ? 'mitochondria' : type;
    /* eslint-disable-next-line react/jsx-props-no-spreading  */
    tabs.push(<Tab key={type} label={label} {...a11yProps(0)} />);
    tabContents.push(<NodeTable key={type} rows={result.data[type]} columns={result.columns[type]} />);
  });

  if (tabs.length === 0) {
    tabs.push(<Tab key="empty" label="No objects found" {...a11yProps(0)} />);
    tabContents.push(<div key="empty-content">No objects found</div>);
  }

  return (
    <div className={classes.root}>
      <div className={classes.scroll}>
        <Tabs value={tabIndex} onChange={handleChange} indicatorColor="primary">
          {tabs}
        </Tabs>
        {tabContents[tabIndex]}
      </div>
    </div>
  );
}

ObjectsView.propTypes = {
  query: PropTypes.object.isRequired,
};
