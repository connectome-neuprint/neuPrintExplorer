/* global VERSION */
/*
 * Top level page for displaying queries and results.
 */
import React, { Suspense } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Select from 'react-select';
import { withRouter } from 'react-router';

import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import { withStyles } from '@material-ui/core/styles';
import Icon from '@material-ui/core/Icon';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import SvgIcon from '@material-ui/core/SvgIcon';
import Tooltip from '@material-ui/core/Tooltip';

import MetaInfo from './MetaInfo';
import Login from './Login';
import { getSiteParams, setQueryString } from '../helpers/queryString';

import './TopBar.css';

const BrainRegions = React.lazy(() => import('./BrainRegions'));


// adapted from material ui example
const styles = theme => ({
  appBar: {
    zIndex: theme.zIndex.drawer + 1
  },
  grow: {
    flexGrow: 1
  },
  content: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing(3),
    minWidth: 0 // So the Typography noWrap works
  },
  img: {
    width: 120
  },
  textBox: {
    backgroundColor: theme.palette.common.white,
    padding: theme.spacing(1),
    color: 'red'
  },
  search: {
    fontFamily: theme.typography.fontFamily,
    width: '15em',
    marginLeft: '2em'
  },
  bounce: {
    animation: 'iconbounce 0.5s 3 ease',
    display: 'inline-block',
    position: 'relative'
  },
  button: {
    marginRight: theme.spacing(1),
    color: theme.palette.common.white
  }
});

const selectStyles = {
  placeholder: () => ({
    color: '#fff'
  }),
  singleValue: provided => ({
    ...provided,
    color: '#fff'
  }),
  menu: provided => ({
    ...provided,
    color: '#333'
  }),
  control: provided => ({
    ...provided,
    background: '#396a9f',
    border: '1px solid #fff'
  })
};

function handleFullScreen() {
  setQueryString({
    rt: ''
  });
}

class TopBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showBrainRegions: false
    };
  }

  handleChange = selectedDataSet => {
    const { location } = this.props;

    const qsParams = getSiteParams(location);
    const newdatasets = [selectedDataSet.value];
    const oldparams = qsParams;
    oldparams.datasets = newdatasets;
    setQueryString({
      dataset: selectedDataSet.value
    });
    // clear out the plugin values whenever the data set
    // is changed.
    setQueryString({
      plugins: []
    });
  };

  handleRegionClick = () => {
    const { showBrainRegions } = this.state;
    this.setState({ showBrainRegions: !showBrainRegions });
  };

  render() {
    const { classes, loggedIn, location, datasetInfo } = this.props;
    const { showBrainRegions } = this.state;
    const qsParams = getSiteParams(location);
    const dataSetOptions = Object.keys(datasetInfo).filter(dataset => datasetInfo[dataset].hidden !== true).map(dataset => ({
      value: dataset,
      label: dataset
    }));

    const dataSet = qsParams.get('dataset');

    const datasetstr = dataSet || 'Select a dataset';

    const fullscreen = qsParams.get('rt');

    return (
      <AppBar position="absolute" className={classes.appBar}>
        {showBrainRegions && (

            <Suspense fallback={<div>loading...</div>}>
          <BrainRegions onClose={this.handleRegionClick} dataSet={datasetstr} />
        </Suspense>)}
        {loggedIn && <MetaInfo dataSet={dataSet} />}
        <Toolbar>
          <div>
            <Tooltip title={VERSION} placement="bottom" enterDelay={300}>
              <Link to="/">
                <img
                  alt="neuprintexplorer logo - home link"
                  src="/public/neuprintexplorerw.png"
                  className={classes.img}
                />
              </Link>
            </Tooltip>
            <p style={{margin: 0, marginTop: '-7px'}}> exploring inter and intra cellular interactions</p>
          </div>
          {loggedIn && (
            <Select
              inputId="dataSetSelect"
              className={classes.search}
              styles={selectStyles}
              value={{ value: datasetstr, label: datasetstr }}
              onChange={this.handleChange}
              options={dataSetOptions}
            />
          )}
          <div className={classes.grow} />
          <Button className={classes.button} onClick={this.handleRegionClick}>
            Brain Regions
          </Button>
          {fullscreen === 'full' && (
            <IconButton
              className={classes.button}
              aria-label="Exit Full Screen"
              onClick={() => {
                handleFullScreen();
              }}
            >
              <Icon className={classes.bounce}>fullscreen_exit</Icon>
            </IconButton>
          )}
          <Login />
          <Tooltip title="View Source" placement="bottom" enterDelay={100}>
            <IconButton href="https://github.com/janelia-flyem/neuPrintExplorer">
              <SvgIcon htmlColor="white">
                <path d="M12.007 0C6.12 0 1.1 4.27.157 10.08c-.944 5.813 2.468 11.45 8.054 13.312.19.064.397.033.555-.084.16-.117.25-.304.244-.5v-2.042c-3.33.735-4.037-1.56-4.037-1.56-.22-.726-.694-1.35-1.334-1.756-1.096-.75.074-.735.074-.735.773.103 1.454.557 1.846 1.23.694 1.21 2.23 1.638 3.45.96.056-.61.327-1.178.766-1.605-2.67-.3-5.462-1.335-5.462-6.002-.02-1.193.42-2.35 1.23-3.226-.327-1.015-.27-2.116.166-3.09 0 0 1.006-.33 3.3 1.23 1.966-.538 4.04-.538 6.003 0 2.295-1.5 3.3-1.23 3.3-1.23.445 1.006.49 2.144.12 3.18.81.877 1.25 2.033 1.23 3.226 0 4.607-2.805 5.627-5.476 5.927.578.583.88 1.386.825 2.206v3.29c-.005.2.092.393.26.507.164.115.377.14.565.063 5.568-1.88 8.956-7.514 8.007-13.313C22.892 4.267 17.884.007 12.008 0z" />
              </SvgIcon>
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>
    );
  }
}

TopBar.propTypes = {
  classes: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  loggedIn: PropTypes.bool.isRequired,
  datasetInfo: PropTypes.object.isRequired
};

const TopBarState = state => ({
  userInfo: state.user.userInfo,
  loggedIn: state.user.get('loggedIn'),
  datasetInfo: state.neo4jsettings.get('datasetInfo')
});

export default withRouter(withStyles(styles)(connect(TopBarState, null)(TopBar)));
