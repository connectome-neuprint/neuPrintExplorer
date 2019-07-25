import React from 'react';
import PropTypes from 'prop-types';

import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import ComputerIcon from '@material-ui/icons/Computer';

const styles = theme => ({
  title: {
    marginBottom: 16,
    fontSize: 14
  },
  divider: {
    margin: `${theme.spacing.unit}px 0`
  },
  padLeft: {
    paddingLeft: '1em'
  }
});

function ServerInfoCard (props) {
  const { classes, neoServer, availableDatasets, datasetInfo, loggedIn, authLevel, publicState } = props;

  if (loggedIn) {
    if (authLevel.match(/^readwrite|admin$/) || publicState) {
      return (
        <Card>
          <CardHeader
            title="neuPrint Server Information"
            className="homeCardHeader"
            avatar={
              <ComputerIcon color="primary" />
            }
          />
          <CardContent>
            <Typography component="p">
              server: {neoServer} <br />
            </Typography>
            <Typography component="p">available datasets:</Typography>
            <div className={classes.padLeft}>
              {availableDatasets.map(item => (
                <div key={item}>
                  <Typography>
                    <b>{item}</b>
                  </Typography>
                  <div className={classes.padLeft}>
                    <Typography component="ul">
                      <li>modified: {datasetInfo[item].lastmod}</li>
                      <li>version: {datasetInfo[item].uuid}</li>
                      <li><a href={datasetInfo[item].info}>Information</a></li>
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
    )
  }

  return (
    <Card>
        <CardHeader title="Logged Out" />
        <CardContent>
          <Typography component="p">
            Please log in at the top of the page to access the data.
          </Typography>
        </CardContent>
    </Card>
  );
}

ServerInfoCard.propTypes = {
  classes: PropTypes.object.isRequired,
  loggedIn: PropTypes.bool.isRequired,
  authLevel: PropTypes.string.isRequired,
  availableDatasets: PropTypes.arrayOf(PropTypes.string).isRequired,
  datasetInfo: PropTypes.object.isRequired,
  neoServer: PropTypes.string.isRequired,
  publicState: PropTypes.bool.isRequired
};

export default withStyles(styles)(ServerInfoCard);
