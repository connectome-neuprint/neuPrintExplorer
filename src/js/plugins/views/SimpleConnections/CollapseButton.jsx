import React from 'react';
import PropTypes from 'prop-types';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';

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
