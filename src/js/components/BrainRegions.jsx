import React  from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { Document, Page }  from 'react-pdf/dist/esm/entry.webpack';
import './BrainRegions.css';


export default function BrainRegions(props) {
  const { onClose } = props;
  return (
    <Dialog fullWidth maxWidth="lg" open onClose={onClose}>
      <DialogTitle>Brain regions</DialogTitle>
      <DialogContent>
        <Document file="/public/brainregions.pdf">
          <Page pageNumber={1} scale={1.1} />
        </Document>
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
