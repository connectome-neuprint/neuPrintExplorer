/*
 * Home page contains basic information for the page.
*/

import React from 'react';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';
import _ from 'underscore';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import { withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import SvgIcon from '@material-ui/core/SvgIcon';
import MobileStepper from '@material-ui/core/MobileStepper';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';

const HintText = [
  <Typography>
    Explore high-level region-to-region projectome-level connectivity as an entry point to analysis
    with the <a href="/?openQuery=true&Query%5BqueryType%5D=ROI%20Connectivity">ROI Connectivity</a> query.
  </Typography>,
  <Typography>
    Find neurons using region-based filters with the{' '}
    <a href="/?openQuery=true&Query%5BqueryType%5D=Find%20Neurons">Find Neurons</a> query.
  </Typography>,
  <Typography>
    Click the <Link to="/help">help</Link> icon for detailed information on how the connectome data
    is stored in the graph database.
  </Typography>
];

const styles = theme => ({
  root: {
    flexGrow: 1,
    flexWrap: 'wrap',
    display: 'flex',
    padding: theme.spacing.unit * 3
  },
  roottext: {
    maxWidth: 560,
    margin: '0 auto'
  },
  card: {
    minWidth: 275,
    maxWidth: 500,
    marginLeft: 'auto'
  },
  card2: {
    minWidth: 275,
    maxWidth: 500
  },
  title: {
    marginBottom: 16,
    fontSize: 14
  },
  divider: {
    margin: `${theme.spacing.unit}px 0`
  },
  hint: {
    margin: `${theme.spacing.unit * 2}px 0`
  },
  padLeft: {
    paddingLeft: '1em'
  }
});

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = { activeStep: 0 };
  }

  // if only query string has updated, prevent re-render
  shouldComponentUpdate(nextProps, nextState) {
    nextProps.location['search'] = this.props.location['search'];
    return !_.isEqual(nextProps, this.props) || !_.isEqual(nextState, this.state);
  }

  handleNext = () => {
    this.setState(prevState => ({
      activeStep: prevState.activeStep + 1
    }));
  };

  handleBack = () => {
    this.setState(prevState => ({
      activeStep: prevState.activeStep - 1
    }));
  };

  render() {
    const { classes, theme } = this.props;
    var redirectHome = false;
    if (window.location.pathname !== '/') {
      redirectHome = true;
    }
    return (
      <div className={classes.root}>
        {redirectHome ? <Redirect to="/" /> : <div />}
        <Grid container spacing={24}>
          <Grid item xs={12}>
            <div className={classes.roottext}>
              <Typography variant="h6">Analysis tools for connectomics</Typography>
              <br />
              <Typography >
                neuPrintExplorer provides tools to query and visualize connectomic data stored in{' '}
                <a href="https://github.com/janelia-flyem/neuPrint">neuPrint</a>, which uses a neo4j
                graph database. Use the search icon at the <a href="/?openQuery=true">top left</a>{' '}
                to query the database.
              </Typography>
            </div>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Card className={classes.card}>
              <CardContent>
                <Typography className={classes.title} color="textSecondary">
                  neuPrint Server Information
                </Typography>
                <Divider className={classes.divider} />
                <Typography component="p">
                  server: {this.props.neoServer} <br />
                </Typography>
                <Typography component="p">available datasets:</Typography>
                <div className={classes.padLeft}>
                  {this.props.availableDatasets.map(item => {
                    return (
                      <div key={item}>
                        <Typography>
                          <b>{item}</b>
                        </Typography>
                        <div className={classes.padLeft}>
                          <Typography>
                            modified: {this.props.datasetInfo[item].lastmod} <br />
                            version: {this.props.datasetInfo[item].uuid}
                          </Typography>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Card className={classes.card2}>
              <CardContent>
                <Typography className={classes.title} color="textSecondary">
                  Helpful Hints
                  <SvgIcon nativeColor={'orange'}>
                    <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7zm2.85 11.1l-.85.6V16h-4v-2.3l-.85-.6C7.8 12.16 7 10.63 7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.63-.8 3.16-2.15 4.1z" />
                  </SvgIcon>
                </Typography>
                <Divider className={classes.divider} />

                <div className={classes.hint}>{HintText[this.state.activeStep]}</div>
                <MobileStepper
                  steps={HintText.length}
                  position="static"
                  activeStep={this.state.activeStep}
                  nextButton={
                    <Button
                      size="small"
                      onClick={this.handleNext}
                      disabled={this.state.activeStep === HintText.length - 1}
                    >
                      Next
                      {theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
                    </Button>
                  }
                  backButton={
                    <Button
                      size="small"
                      onClick={this.handleBack}
                      disabled={this.state.activeStep === 0}
                    >
                      {theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
                      Back
                    </Button>
                  }
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </div>
    );
  }
}

var HomeState = function(state) {
  return {
    neoServer: state.neo4jsettings.neoServer,
    availableDatasets: state.neo4jsettings.availableDatasets,
    datasetInfo: state.neo4jsettings.datasetInfo
  };
};

Home.propTypes = {
  location: PropTypes.shape({
    search: PropTypes.string.isRequired
  }),
  classes: PropTypes.object,
  theme: PropTypes.object,
  availableDatasets: PropTypes.array.isRequired,
  datasetInfo: PropTypes.object.isRequired,
  neoServer: PropTypes.string.isRequired
};

export default withStyles(styles, { withTheme: true })(
  connect(
    HomeState,
    null
  )(Home)
);
