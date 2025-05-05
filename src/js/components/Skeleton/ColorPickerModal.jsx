import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { SketchPicker } from 'react-color';
import randomColor from 'randomcolor';

import Popover from '@mui/material/Popover';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import withStyles from '@mui/styles/withStyles';

const styles = () => ({
  colorBox: {
    height: '20px',
    width: '20px',
    border: '1px solid #ccc',
    padding: '1px'
  }
});

const presetColors = [];
for (let i = 0; i < 15; i += 1) {
  presetColors[i] = randomColor({ luminosity: 'light', hue: 'random' });
}

function ColorPickerModal(props) {
  const { currentColor, classes, handleChangeColor, bodyId } = props;

  const [anchorEl, setAnchorEl] = useState(null);

  const colorBoxStyle = {};
  const sketchColor = currentColor || randomColor({ luminosity: 'light', hue: 'random' });

  if (currentColor) {
    colorBoxStyle.backgroundColor = currentColor;
  }

  const changeColor = (newColor) => {
    handleChangeColor(bodyId, newColor.hex);
  }

  return (
    <>
      <Tooltip title="Change Color" placement="top">
        <IconButton
          onClick={event => setAnchorEl(event.currentTarget)}
          aria-label="Change color"
          size="large">
          <div className={classes.colorBox} style={colorBoxStyle} />
        </IconButton>
      </Tooltip>
      <Popover
        id="simple-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <ClickAwayListener onClickAway={() => setAnchorEl(null)}>
          <SketchPicker
            color={sketchColor}
            onChangeComplete={changeColor}
            presetColors={presetColors}
          />
        </ClickAwayListener>
      </Popover>
    </>
  );
}

ColorPickerModal.propTypes = {
  currentColor: PropTypes.string,
  bodyId: PropTypes.string.isRequired,
  handleChangeColor: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired
};

ColorPickerModal.defaultProps = {
  currentColor: null
};

export default withStyles(styles)(ColorPickerModal);
