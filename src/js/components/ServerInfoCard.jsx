import React from 'react';
import PropTypes from 'prop-types';

import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { withStyles } from '@material-ui/core/styles';
import ComputerIcon from '@mui/icons-material/Computer';
import WarningIcon from '@mui/icons-material/Warning';

import Login from './Login';

const styles = () => ({
  title: {
    marginBottom: 16,
    fontSize: 14
  },
  padLeft: {
    paddingLeft: '1em'
  }
});

function ServerInfoCard(props) {
  const {
    classes,
    neoServer,
    datasetInfo,
    loggedIn,
    authLevel,
    publicState
  } = props;

  if (loggedIn) {
    if (authLevel.match(/^readwrite|admin$/) || publicState) {
      return (
        <Card>
          <CardHeader
            title="neuPrint+ Server Information"
            className="homeCardHeader"
            avatar={<ComputerIcon color="primary" />}
          />
          <CardContent>
            <Typography component="p">
              server: {neoServer} <br />
            </Typography>
            <Typography component="p">available datasets:</Typography>
            <div className={classes.padLeft}>
              {Object.keys(datasetInfo).filter(dataset => datasetInfo[dataset].hidden !== true).map(item => (
                <div key={item}>
                  <Typography>
                    <b>{item}</b>
                  </Typography>
                  <div className={classes.padLeft}>
                    <Typography component="ul">
                      <li>modified: {datasetInfo[item].lastmod}</li>
                      <li>version: {datasetInfo[item].uuid}</li>
                      <li>
                        <a href={datasetInfo[item].info}>Information</a>
                      </li>
                    </Typography>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      );
    }
    return (
      <Card>
        <CardHeader title="Authorization Required" />
        <CardContent>
          <Typography component="p">
            Please contact your server administrator to gain access.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader
        className="homeCardHeader"
        title="Logged Out"
        avatar={<WarningIcon color="error" />}
      />
      <CardContent>
        <Typography component="h4">
          Please log in with a google account to access the data.
          <Login />
        </Typography>
      </CardContent>
    </Card>
  );
}

ServerInfoCard.propTypes = {
  classes: PropTypes.object.isRequired,
  loggedIn: PropTypes.bool.isRequired,
  authLevel: PropTypes.string.isRequired,
  datasetInfo: PropTypes.object.isRequired,
  neoServer: PropTypes.string.isRequired,
  publicState: PropTypes.bool.isRequired
};

export default withStyles(styles)(ServerInfoCard);
