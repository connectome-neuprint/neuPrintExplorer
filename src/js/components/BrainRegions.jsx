import React  from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import './BrainRegions.css';


export default function BrainRegions(props) {
  const { onClose } = props;
  return (
    <Dialog fullWidth maxWidth="lg" open onClose={onClose}>
      <DialogTitle>Brain regions</DialogTitle>
      <DialogContent>
        <img style={{width: "100%"}} src="/public/brainregions.png" alt="brain regions diagram" />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

BrainRegions.propTypes = {
  onClose: PropTypes.func.isRequired,
};
