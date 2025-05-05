import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Dialog from '@mui/material/Dialog';
import DialogContentText from '@mui/material/DialogContentText';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';


import { skeletonAddandOpen } from 'actions/skeleton';

export default function AddIdModal(props) {
  const { open, handleClose, index } = props;

  const [bodyId, setBodyId] = useState();
  const dispatch = useDispatch();

  const addBodyId = () => {
    // add the body id to the skeleton
    if (bodyId) {
      // TODO: There is no validation to check if the bodyId is valid!!!!!
      dispatch(skeletonAddandOpen(bodyId, null, index));
    }
    // TODO: we need to prompt for a bodyId if it wasn't entered.
    // close the dialog.
    handleClose();
  }


  return (
    <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
      <DialogTitle id="form-dialog-title">Add Body Id</DialogTitle>
      <DialogContent>
        <DialogContentText>Enter another body id to display</DialogContentText>
        <TextField
          autoFocus
          margin="dense"
          id="body_id"
          label="body id"
          fullWidth
          onChange={event => setBodyId(event.target.value) }
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Cancel
        </Button>
        <Button onClick={addBodyId} color="primary">
          Show
        </Button>
      </DialogActions>
    </Dialog>
  );
}

AddIdModal.propTypes = {
  open: PropTypes.bool.isRequired,
  index: PropTypes.number.isRequired,
  handleClose: PropTypes.func.isRequired
};
