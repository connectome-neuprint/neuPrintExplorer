import React from 'react';
import PropTypes from 'prop-types';

import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';

export default function HPWeightSlider(props) {
  const { formControlClass, useHighConfidence, toggleHighConfidence } = props;
  return (
    <FormControl variant="standard" className={formControlClass}>
      <FormControlLabel
        control={
          <Switch
            checked={useHighConfidence}
            onChange={() => {
              toggleHighConfidence();
            }}
            color="primary"
          />
        }
        label={
          <Typography variant="body1" style={{ display: 'inline-flex' }}>
            Limit to high-confidence synapses
          </Typography>
        }
      />
    </FormControl>
  );
}

HPWeightSlider.propTypes = {
  formControlClass: PropTypes.string.isRequired,
  useHighConfidence: PropTypes.bool.isRequired,
  toggleHighConfidence: PropTypes.func.isRequired
};
