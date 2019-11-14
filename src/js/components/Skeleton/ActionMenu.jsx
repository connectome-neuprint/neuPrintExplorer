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
    const { handleClick, body } = this.props;
    handleClick(body.get('name').toString());
  };

  handleDelete = () => {
    const { handleDelete, body } = this.props;
    handleDelete(body.get('name').toString());
    this.setState({ anchorEl: null });
  };

  handleChangeColor = newColor => {
    const { handleChangeColor, body } = this.props;
    handleChangeColor(body.get('name').toString(), newColor.hex);
  };

  render() {
    const { classes, body, color, synapseRadius, isVisible, dataSet } = this.props;
    const { anchorEl } = this.state;

    return (
      <React.Fragment>
        <Chip
          key={body.get('name')}
          label={body.get('name')}
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
          key={`${body.get('name')}_popover`}
          open={Boolean(anchorEl)}
        >
          <Typography variant="h5" className={classes.popoverTitle}>Modify body {body.get('name')}</Typography>
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
              <SynapseSelection isInput body={body} dataSet={dataSet} synapseRadius={synapseRadius} />
            </Grid>
            <Grid item xs={4}>
              <SynapseSelection isInput={false} body={body} dataSet={dataSet} synapseRadius={synapseRadius} />
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
  body: PropTypes.object.isRequired,
  dataSet: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
  synapseRadius: PropTypes.number.isRequired,
  classes: PropTypes.object.isRequired,
  isVisible: PropTypes.bool.isRequired,
  handleDelete: PropTypes.func.isRequired,
  handleClick: PropTypes.func.isRequired,
  handleChangeColor: PropTypes.func.isRequired
};

export default withStyles(styles)(ActionMenu);
