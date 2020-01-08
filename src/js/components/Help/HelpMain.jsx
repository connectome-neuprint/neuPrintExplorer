import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import Modal from '@material-ui/core/Modal';
import Icon from '@material-ui/core/Icon';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';

const styles = () => ({
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
  img: {
    maxWidth: '100%',
    minWidth: '500px'
  },
  bold: { fontWeight: 'bold', display: 'inline' }
});

function HelpMain(props) {
  const { classes } = props;
  const [open, setOpen] = useState(false);

  return (
    <div style={{ padding: 8 * 3, width: '100%'}}>
      <div className={classes.roottext}>
        <Typography variant="h6">Overview</Typography>
        <Typography>
          The data is stored in Neo4j, a graph database, and is accessible through custom Cypher
          queries. This app provides a series of interfaces to simplify common access patterns.
        </Typography>
        <br />
        <Typography>
          The primary entry point into the graph model is the{' '}
          <span className={classes.bold}>Neuron</span> node type. Neurons (each which could be a
          subset or superset of an actual neuron due to errors in automatic image segmentation) are
          connected to other neurons via synaptic connections. To provide more granularity into the
          connectomic dataset, the <span className={classes.bold}>SynapseSet</span> nodes point to a
          set of <span className={classes.bold}>Synapse</span> nodes that give the exact locations
          of all synaptic connections for a given neuron. In a similar way, the morphology of the
          neuron is encoded by a link (<span className={classes.bold}>Skeleton</span> nodes) to a
          set of skeleton nodes (<span className={classes.bold}>SkelNodes</span>) with size and
          shape values. Each neuron and synapse is labeled with the given region(s) that they belong
          to for fast region-based queries.
        </Typography>
        <br />
        <Typography>
          Specific properties can be easily added to Neo4j as needed. More details of the graph
          model are shown in the accompanying illustration.
        </Typography>
        <br />
        <Typography variant="h6">Navigating the Data</Typography>
        <Typography>
          See the{' '}
          <a href="https://github.com/connectome-neuprint/neuPrint/blob/master/pgmspecs.md">
            documentation
          </a>{' '}
          or <a href="public/neuprintuserguide_121818.pdf">user guide</a>. Note that Cypher queries
          for all plugin results can be viewed by clicking the <Icon fontSize="inherit">info</Icon>{' '}
          icon in the top bar.
        </Typography>
      </div>
      <div className={classes.flex}>
        <Button onClick={() => setOpen(true)}>
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
          onClose={() => setOpen(false)}
        >
          <div className={classes.graphModel}>
            <Button onClick={() => setOpen(false)}>
              <img
                src="/public/datamodel.png"
                alt="Neo4j graph model diagram"
                className={classes.img}
              />
            </Button>
          </div>
        </Modal>
      </div>
    </div>
  );
}

HelpMain.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(HelpMain);
