import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import './BrainRegions.css';

const defaultSrc = '/public/brainregions.png';

export default function BrainRegions(props) {
  const { onClose, dataSet } = props;

  const [brainRegionSrc, setBrainRegionSrc] = useState(null);

  useEffect(() => {
    // check to see if dataSet image exists.
    const checkImageExists = async () => {
      const img = new Image();
      const versionStrippedDataset = dataSet.replace(/:\S+$/, '');
      const regionSrc = `/public/brainregions-${versionStrippedDataset}.png`;
      img.src = regionSrc;

      img.onload = () => {
        // Image exists, set the path in the state
        setBrainRegionSrc(regionSrc);
      };

      img.onerror = () => {
        // Image does not exist, set default image
        setBrainRegionSrc(defaultSrc);
      };
    };

    checkImageExists();
  }, [dataSet, setBrainRegionSrc]);

  return (
    <Dialog fullWidth maxWidth="lg" open onClose={onClose}>
      <DialogTitle>Brain regions</DialogTitle>
      <DialogContent>
        {brainRegionSrc ? (
          <img style={{ width: '100%' }} src={brainRegionSrc} alt="brain regions diagram" />
        ) : (
          <p>Loading...</p>
        )}
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
  dataSet: PropTypes.string.isRequired,
};
