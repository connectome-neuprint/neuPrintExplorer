import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import Modal from '@material-ui/core/Modal';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import HelpTutorial from './HelpTutorial';

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
    <div style={{ padding: 8 * 3, width: '100%' }}>
      <div className={classes.roottext}>
        <Typography variant="h6">Overview</Typography>
        <Typography>
          neuPrint is a set of connectome analysis tools. This web application allows users to
          explore connectome data interactively. To start exploring the available datasets, please
          login using any google credential above. For more technical details of neuPrint and the
          underlying data representation please consult the{' '}
          <a href="public/neuprintuserguide_010820.pdf">user guide</a>. For those that want to
          launch their own neuPrint ecosystem locally, please consulting the github page for{' '}
          <a href="https://github.com/connectome-neuprint/neuprint">neuprint</a>
        </Typography>
        <br />
      </div>
      <Typography>For new neuPrintExplorer users, please examine the quick guide below</Typography>
      <HelpTutorial />
      <Typography>Shows how connectomic data is represented in neuPrint</Typography>
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
