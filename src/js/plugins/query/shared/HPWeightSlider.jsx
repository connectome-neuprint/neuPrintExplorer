import React from 'react';
import PropTypes from 'prop-types';

import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import Typography from '@material-ui/core/Typography';

export default function HPWeightSlider(props) {
  const { formControlClass, useHighConfidence, toggleHighConfidence } = props;
  return (
    <FormControl className={formControlClass}>
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
