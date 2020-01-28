import React from 'react';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';

const styles = () => ({
  root: {
    flexGrow: 1
  },
  roottext: {
    flex: 1
  },
  video: {
    position: 'relative',
    paddingBottom: '56.25%',
    width: '100%',
    height: '0'
  },
  iframe: {
    position: 'absolute',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%'
  }
});

function HelpVideos(props) {
  const { classes } = props;
  return (
    <div className={classes.root} style={{ padding: 8 * 3, width: '100%' }}>
      <div className={classes.roottext}>
        <Typography variant="h4" gutterBottom>Tutorial videos highlighting different aspects of neuPrintExplorer</Typography>
      </div>
      <Grid container spacing={24}>
        <Grid item xs={12} sm={12} lg={6}>
          <div className={classes.video}>
            <iframe
              className={classes.iframe}
              title="Getting started"
              width="560"
              height="315"
              src="https://www.youtube.com/embed/FlpMlS9lixk"
              frameBorder="0"
              allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </Grid>
        <Grid item xs={12} sm={12} lg={6}>
          <div className={classes.video}>
            <iframe
              className={classes.iframe}
              title="Finding neurons"
              width="560"
              height="315"
              src="https://www.youtube.com/embed/94DydJL_zlk"
              frameBorder="0"
              allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </Grid>
        <Grid item xs={12} sm={12} lg={6}>
          <div className={classes.video}>
            <iframe
              className={classes.iframe}
              title="Providing reconstruction feedback"
              width="560"
              height="315"
              src="https://www.youtube.com/embed/n2cwzaSO9I0"
              frameBorder="0"
              allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </Grid>
        <Grid item xs={12} sm={12} lg={6}>
          <div className={classes.video}>
            <iframe
              className={classes.iframe}
              title="Common connectivity query"
              width="560"
              height="315"
              src="https://www.youtube.com/embed/VAtI6V86qlY"
              frameBorder="0"
              allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </Grid>
        <Grid item xs={12} sm={12} lg={6}>
          <div className={classes.video}>
            <iframe
              className={classes.iframe}
              title="Shortest Path Query"
              width="560"
              height="315"
              src="https://www.youtube.com/embed/XMzQVTfNoYA"
              frameBorder="0"
              allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </Grid>
      </Grid>
    </div>
  );
}

HelpVideos.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(HelpVideos);
