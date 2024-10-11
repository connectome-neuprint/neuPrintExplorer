import React from 'react';
import PropTypes from 'prop-types';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';

const styles = () => ({
  regexWarning: {
    fontSize: '0.9em'
  }
});

class AdvancedNeuronInput extends React.Component {
  handleChange = event => {
    const { onChange } = this.props;
    const { value } = event.target;
    onChange(value);
  };

  handleKeyDown = event => {
    const { handleSubmit } = this.props;
    // submit request if user presses enter
    if (event.keyCode === 13) {
      event.preventDefault();
      handleSubmit();
    }
  };

  render() {
    const { value, classes } = this.props;
    return (
      <>
        <TextField
          label="Neuron Instance, Type or BodyID (optional)"
          multiline
          rows={1}
          fullWidth
          value={value}
          rowsMax={4}
          className={classes.textField}
          onChange={this.handleChange}
          onKeyDown={this.handleKeyDown}
        />
        <Typography color="error" className={classes.regexWarning}>
          Warning!! This is a regular expression search and characters like &#39;&#40;&#39; must be
          escaped. eg: to search for &#39;c(SFS)_R&#39; you would need to type
          &#39;c\\(SFS\\)_R&#39; For more details on how to write regular expressions, please see{' '}
          <a href="https://www.regular-expressions.info/">https://www.regular-expressions.info/</a>
        </Typography>
      </>
    );
  }
}

AdvancedNeuronInput.propTypes = {
  classes: PropTypes.object.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  onChange: PropTypes.func,
  value: PropTypes.string
};

AdvancedNeuronInput.defaultProps = {
  onChange: () => {},
  value: ''
};

export default withStyles(styles)(AdvancedNeuronInput);
