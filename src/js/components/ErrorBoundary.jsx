import React from 'react';
import PropTypes from 'prop-types';

import { Link } from 'react-router-dom';

import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import SvgIcon from '@mui/material/SvgIcon';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import withStyles from '@mui/styles/withStyles';

const styles = theme => ({
  appBar: {
    zIndex: theme.zIndex.drawer + 1
  },
  grow: {
    flexGrow: 1
  },
  content: {
    overflow: 'hidden',
    margin: '5em 3em',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: theme.palette.background.default,
    padding: 0,
    width: '100%',
    minWidth: 0 // So the Typography noWrap works
  },
  img: {
    width: 120
  }
});

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  /* componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    logErrorToMyService(error, errorInfo);
  } */

  render() {
    const { hasError } = this.state;
    const { children, classes } = this.props;
    if (hasError) {
      // You can render any custom fallback UI
      return (
        <>
          <AppBar position="absolute" className={classes.appBar}>
            <Toolbar>
              <Link to="/">
                <img
                  alt="neuprintexplorer logo - home link"
                  src="/public/neuprintexplorerw.png"
                  className={classes.img}
                />
              </Link>
              <div className={classes.grow} />
              <Tooltip title="View Source" placement="bottom" enterDelay={100}>
                <IconButton href="https://github.com/janelia-flyem/neuPrintExplorer" size="large">
                  <SvgIcon htmlColor="white">
                    <path d="M12.007 0C6.12 0 1.1 4.27.157 10.08c-.944 5.813 2.468 11.45 8.054 13.312.19.064.397.033.555-.084.16-.117.25-.304.244-.5v-2.042c-3.33.735-4.037-1.56-4.037-1.56-.22-.726-.694-1.35-1.334-1.756-1.096-.75.074-.735.074-.735.773.103 1.454.557 1.846 1.23.694 1.21 2.23 1.638 3.45.96.056-.61.327-1.178.766-1.605-2.67-.3-5.462-1.335-5.462-6.002-.02-1.193.42-2.35 1.23-3.226-.327-1.015-.27-2.116.166-3.09 0 0 1.006-.33 3.3 1.23 1.966-.538 4.04-.538 6.003 0 2.295-1.5 3.3-1.23 3.3-1.23.445 1.006.49 2.144.12 3.18.81.877 1.25 2.033 1.23 3.226 0 4.607-2.805 5.627-5.476 5.927.578.583.88 1.386.825 2.206v3.29c-.005.2.092.393.26.507.164.115.377.14.565.063 5.568-1.88 8.956-7.514 8.007-13.313C22.892 4.267 17.884.007 12.008 0z" />
                  </SvgIcon>
                </IconButton>
              </Tooltip>
            </Toolbar>
          </AppBar>
          <main className={classes.content}>
            <Typography variant="h1">Error. Something went wrong.</Typography>
            <Typography variant="h2">Please reload your page to continue.</Typography>
            <Typography>
              If the error persists, please contact us.
              <a href="mailto:neuprint@janelia.hhmi.org">neuprint@janelia.hhmi.org</a>
            </Typography>
          </main>
        </>
      );
    }

    return children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(ErrorBoundary);
