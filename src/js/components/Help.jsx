/*
 * Help page provides documentation.
 */
import React from 'react';
import Typography from '@material-ui/core/Typography';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Modal from '@material-ui/core/Modal';
// import { Deck, Slide, Image } from 'spectacle';
// import {SwaggerUI} from 'react-swagger-ui'
// import 'react-swagger-ui/dist/swagger-ui.css'
import SwaggerUi, { presets } from 'swagger-ui';
import 'swagger-ui/dist/swagger-ui.css';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import AppBar from '@material-ui/core/AppBar';

function TabContainer(props) {
  const { children } = props;
  return (
    <Typography component="div" style={{ padding: 8 * 3 }}>
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
  overflow: {
    overflow: 'auto'
  },
  secroot: {
    position: 'relative',
    width: '100%',
    height: '100%'
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
    if (value === 1) {
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

    // <SwaggerUI url='/swagger.yaml' spec={object} />
    return (
      <div className={classes.root}>
        <AppBar position="static" color="default">
          <Tabs value={value} onChange={this.handleChange}>
            <Tab label="Model Overview" />
            <Tab label="neuPrint API" />
            <Tab label="Slides" />
          </Tabs>
        </AppBar>

        {value === 0 && (
          <TabContainer>
            <div className={classes.roottext}>
              <Typography variant="h6">Graph Data Model</Typography>
              <Typography>
                The data is stored in Neo4j, a graph database, and is accessible through custom
                Cypher queries. This app provides a series of interfaces to simplify common access
                patterns.
              </Typography>
              <br />
              <Typography>
                The primary entry point into the graph model is the{' '}
                <div className={classes.bold}>Neuron</div> node type. Neurons (each which could be a
                subset or superset of an actual neuron due to errors in automatic image
                segmentation) are connected to other neurons via synaptic connections. To provide
                more granularity into the connectomic dataset, the{' '}
                <div className={classes.bold}>SynapseSet</div> nodes point to a set of{' '}
                <div className={classes.bold}>Synapse</div> nodes that give the exact locations of
                all synaptic connections for a given neuron. In a similar way, the morphology of the
                neuron is encoded by a link (<div className={classes.bold}>Skeleton</div> nodes) to
                a set of skeleton nodes (<div className={classes.bold}>SkelNodes</div>) with size
                and shape values. Each neuron and synapse is labeled with the given region(s) that
                they belong to for fast region-based queries.
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
                </a>
                or <a href="public/neuprintuserguide_121818.pdf">user guide</a>.
              </Typography>
            </div>
            <div className={classes.flex}>
              <Button onClick={this.handleOpen}>
                <img
                  src="https://raw.githubusercontent.com/connectome-neuprint/neuPrint/master/pgmv1.png"
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
                <div className={classes.overflow}>
                  <Button onClick={this.handleClose}>
                    <img
                      src="https://raw.githubusercontent.com/connectome-neuprint/neuPrint/master/pgmv1.png"
                      alt="Neo4j graph model diagram"
                    />
                  </Button>
                </div>
              </Modal>
            </div>
          </TabContainer>
        )}
        {value === 1 && (
          <TabContainer>
            <div id="swaggerContainer" />
          </TabContainer>
        )}
        {value === 2 && (
          <TabContainer>
            <div className={classes.roottext}>
              <Typography>The following slides describe how data is stored in Neo4j.</Typography>
            </div>
            {/* <div className={classes.secroot}>
                        <Deck
                                controls
                        >
                        {
                            _.range(1, MaxSlideNum+1).map( val => {
                                return (<Slide
                                                bgColor={"#D0D0D0"}
                                                key={val}
                                        >
                                                <Image
                                                        src={"/public/graphmodel/Slide" + String(val) + ".jpeg"}
                                                />
                                        </Slide>)
                            })
                        }
                        </Deck>
                    </div> */}
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
