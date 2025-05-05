import React from 'react';
import PropTypes from 'prop-types';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';

class CollapseButton extends React.Component {

  handleChange = event => {
    const { callback }  = this.props;
    callback(event.target.checked);
  };

  render() {
    const {checked} = this.props;
    return (
      <FormGroup row>
        <FormControlLabel
          control={
            <Switch checked={checked} value="checkedA" onChange={this.handleChange} color="primary" />
          }
          label="Collapse by Type"
        />
      </FormGroup>
    );
  }
}

CollapseButton.propTypes = {
  checked: PropTypes.bool.isRequired,
  callback: PropTypes.func.isRequired
};

export default CollapseButton;
