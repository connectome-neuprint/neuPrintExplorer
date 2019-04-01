import React from 'react';
import PropTypes from 'prop-types';

import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import Divider from '@material-ui/core/Divider';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
  card: {
    minWidth: 275,
    maxWidth: 500,
    marginLeft: 'auto'
  },
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
  const { classes, neoServer, availableDatasets, datasetInfo, loggedIn, authLevel } = props;

  if (loggedIn) {
    if (authLevel === "readwrite") {
      return (
        <Card className={classes.card}>
          <CardContent>
            <Typography className={classes.title} color="textSecondary">
              neuPrint Server Information
            </Typography>
            <Divider className={classes.divider} />
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
                    <Typography>
                      modified: {datasetInfo[item].lastmod} <br />
                      version: {datasetInfo[item].uuid}
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
      <Card className={classes.card}>
        <CardContent>
          <Typography className={classes.title} color="textSecondary">
            Authorization Required
          </Typography>
          <Divider className={classes.divider} />
          <Typography component="p">
            Please contact your server administrator to gain access.
          </Typography>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={classes.card}>
        <CardHeader title="Logged Out" />
        <CardContent>
          <Typography component="p">
            Please log at the top of the page to access the data.
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
  neoServer: PropTypes.string.isRequired
};

export default withStyles(styles)(ServerInfoCard);
