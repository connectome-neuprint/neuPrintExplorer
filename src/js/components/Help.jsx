/*
 * Help page provides documentation.
 */
import React from 'react';
import Typography from '@material-ui/core/Typography';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Modal from '@material-ui/core/Modal';
import Icon from '@material-ui/core/Icon';
import SwaggerUi, { presets } from 'swagger-ui';
import 'swagger-ui/dist/swagger-ui.css';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import AppBar from '@material-ui/core/AppBar';

function TabContainer(props) {
  const { children } = props;
  return (
    <Typography component="div" style={{ padding: 8 * 3, width: '100%'}}>
      {children}
    </Typography>
  );
}

TabContainer.propTypes = {
  children: PropTypes.node.isRequired
};

const styles = theme => ({
  root: {
    overflow: 'scroll',
    position: 'relative',
    width: '100%',
    height: '100%',
    padding: theme.spacing.unit * 3
  },
  roottext: {
    flex: 1
  },
  flex: {
    flex: 1,
    padding: '1em'
  },
  graphModel: {
    background: '#fff'
  },
  secroot: {
    position: 'relative',
    width: '100%',
    height: '600px'
  },
  img: {
    maxWidth: '100%',
    minWidth: '500px'
  },
  bold: { fontWeight: 'bold', display: 'inline' }
});

class Help extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      value: 0
    };
  }

  componentDidUpdate() {
    const { value } = this.state;
    if (value === 3) {
      SwaggerUi({
        dom_id: '#swaggerContainer',
        url: '/api/help/swagger.yaml',
        presets: [presets.apis]
      });
    }
  }

  handleOpen = () => {
    this.setState({ open: true });
  };

  handleClose = () => {
    this.setState({ open: false });
  };

  handleChange = (event, value) => {
    this.setState({ value });
  };

  render() {
    const { classes } = this.props;
    const { value, open } = this.state;

    return (
      <div className={classes.root}>
        <AppBar position="static" color="default">
          <Tabs value={value} onChange={this.handleChange}>
            <Tab label="Overview" />
            <Tab label="Basic Analysis" />
            <Tab label="Batch Analysis" />
            <Tab label="Programmer's Interface" />
            <Tab label="Technical Details" />
          </Tabs>
        </AppBar>

        {value === 0 && (
          <TabContainer>
            <div className={classes.roottext}>
              <Typography variant="h6">Overview</Typography>
              <Typography>
                The data is stored in Neo4j, a graph database, and is accessible through custom
                Cypher queries. This app provides a series of interfaces to simplify common access
                patterns.
              </Typography>
              <br />
              <Typography>
                The primary entry point into the graph model is the{' '}
                <span className={classes.bold}>Neuron</span> node type. Neurons (each which could be
                a subset or superset of an actual neuron due to errors in automatic image
                segmentation) are connected to other neurons via synaptic connections. To provide
                more granularity into the connectomic dataset, the{' '}
                <span className={classes.bold}>SynapseSet</span> nodes point to a set of{' '}
                <span className={classes.bold}>Synapse</span> nodes that give the exact locations of
                all synaptic connections for a given neuron. In a similar way, the morphology of the
                neuron is encoded by a link (<span className={classes.bold}>Skeleton</span> nodes)
                to a set of skeleton nodes (<span className={classes.bold}>SkelNodes</span>) with
                size and shape values. Each neuron and synapse is labeled with the given region(s)
                that they belong to for fast region-based queries.
              </Typography>
              <br />
              <Typography>
                Specific properties can be easily added to Neo4j as needed. More details of the
                graph model are shown in the accompanying illustration.
              </Typography>
              <br />
              <Typography variant="h6">Navigating the Data</Typography>
              <Typography>
                See the{' '}
                <a href="https://github.com/connectome-neuprint/neuPrint/blob/master/pgmspecs.md">
                  documentation
                </a>{' '}
                or <a href="public/neuprintuserguide_121818.pdf">user guide</a>. Note that Cypher
                queries for all plugin results can be viewed by clicking the{' '}
                <Icon fontSize="inherit">info</Icon> icon in the top bar.
              </Typography>
            </div>
            <div className={classes.flex}>
              <Button onClick={this.handleOpen}>
                <img
                  src="/public/datamodel.png"
                  alt="Neo4j graph model diagram"
                  className={classes.img}
                />
              </Button>
              <Modal
                aria-labelledby="Neo4j Graph Model"
                aria-describedby="simple-modal-description"
                open={open}
                onClose={this.handleClose}
              >
                <div className={classes.graphModel}>
                  <Button onClick={this.handleClose}>
                    <img
                      src="/public/datamodel.png"
                      alt="Neo4j graph model diagram"
                      className={classes.img}
                    />
                  </Button>
                </div>
              </Modal>
            </div>
          </TabContainer>
        )}
        {value === 1 && (
          <TabContainer>
            <div className={classes.roottext}>
              <Typography>tutorial videos and biological terms</Typography>
            </div>
          </TabContainer>
        )}
        {value === 2 && (
          <TabContainer>
            <div className={classes.roottext}>
              <Typography>data modelling and batch analysis</Typography>
            </div>
          </TabContainer>
        )}
        {value === 3 && (
          <TabContainer>
            <div id="swaggerContainer" />
          </TabContainer>
        )}
        {value === 4 && (
          <TabContainer>
            <div className={classes.roottext}>
              <Typography>low-level technical details. neuprint paper link, how to download.</Typography>
            </div>
          </TabContainer>
        )}
      </div>
    );
  }
}

Help.propTypes = {
  location: PropTypes.shape({
    search: PropTypes.string.isRequired
  }).isRequired,
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Help);
