import React from 'react';
import PropTypes from 'prop-types';
import { SketchPicker } from 'react-color';
import randomColor from 'randomcolor';
import Chip from '@material-ui/core/Chip';
import Grid from '@material-ui/core/Grid';
import Popover from '@material-ui/core/Popover';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import { pickTextColorBasedOnBgColorAdvanced } from '@neuprint/support';

import SynapseSelection from 'containers/Skeleton/SynapseSelection';

const styles = theme => ({
  chip: {
    margin: theme.spacing.unit / 2
  },
  popover: {
    width: '800px',
    overflow: 'hidden'
  },
  synapseList: {
    height: '320px',
    overflow: 'auto'
  },
  popoverTitle: {
    margin: '1em'
  },
  visToggle: {
    position: 'absolute',
    top: '5px',
    right: '5px'
  }
});

const presetColors = [];
for (let i = 0; i < 15; i += 1) {
  presetColors[i] = randomColor({ luminosity: 'light', hue: 'random' });
}


class ActionMenu extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      anchorEl: null,
    };
  }

  handleClick = event => {
    this.setState({ anchorEl: event.currentTarget });
  };

  handleClose = () => {
    this.setState({ anchorEl: null });
  };

  handleVisible = () => {
    const { handleClick, bodyId } = this.props;
    handleClick(bodyId.toString());
  };

  handleDelete = () => {
    const { handleDelete, bodyId } = this.props;
    handleDelete(bodyId.toString());
    this.setState({ anchorEl: null });
  };

  handleChangeColor = newColor => {
    const { handleChangeColor, bodyId } = this.props;
    handleChangeColor(bodyId.toString(), newColor.hex);
  };

  render() {
    const { classes, bodyId, color, isVisible, dataSet } = this.props;
    const { anchorEl } = this.state;

    return (
      <React.Fragment>
        <Chip
          key={bodyId}
          label={bodyId}
          onDelete={this.handleDelete}
          onClick={this.handleClick}
          className={classes.chip}
          style={{
            background: color,
            color: pickTextColorBasedOnBgColorAdvanced(color, '#fff', '#000')
          }}
        />
        <Popover
          onClose={this.handleClose}
          anchorEl={anchorEl}
          key={`${bodyId}_popover`}
          open={Boolean(anchorEl)}
        >
          <Typography variant="h5" className={classes.popoverTitle}>Modify body {bodyId}</Typography>
          <FormControlLabel
            className={classes.visToggle}
            control={
              <Switch
                onChange={this.handleVisible}
                checked={isVisible}
                color="primary"
              />
            }
            label="Toggle Visible"
          />
          <Grid
            container
            spacing={24}
            className={classes.popover}
          >
            <Grid item xs={4}>
              <SynapseSelection isInput bodyId={bodyId} dataSet={dataSet} />
            </Grid>
            <Grid item xs={4}>
              <SynapseSelection isInput={false} bodyId={bodyId} dataSet={dataSet} />
            </Grid>
            <Grid item xs={3}>
              <Typography variant="subtitle2">Change Color:</Typography>
              <SketchPicker
                color={color}
                onChangeComplete={this.handleChangeColor}
                presetColors={presetColors}
              />
            </Grid>
          </Grid>
        </Popover>
      </React.Fragment>
    );
  }
}

ActionMenu.propTypes = {
  bodyId: PropTypes.number.isRequired,
  dataSet: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
  classes: PropTypes.object.isRequired,
  isVisible: PropTypes.bool.isRequired,
  handleDelete: PropTypes.func.isRequired,
  handleClick: PropTypes.func.isRequired,
  handleChangeColor: PropTypes.func.isRequired
};

export default withStyles(styles)(ActionMenu);
