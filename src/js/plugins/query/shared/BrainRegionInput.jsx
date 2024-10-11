import React from 'react';
import PropTypes from 'prop-types';
import Select, { components } from 'react-select';
import { withStyles } from '@material-ui/core/styles';

function CustomInput(props) {
  return <components.Input {...props} onPaste={props.selectProps.onPaste} />
}

CustomInput.propTypes = {
  selectProps: PropTypes.object.isRequired
};


const styles = theme => ({
  select: {
    fontFamily: theme.typography.fontFamily,
    margin: '0.5em 0 1em 0'
  }
});

const formatOptionLabel = ({ label, additionalInfo }) => (
  <div style={{ display: 'flex' }}>
    <div>{label}</div>
    <div style={{ marginLeft: '10px', fontSize: '0.8em' }}>{additionalInfo}</div>
  </div>
);

formatOptionLabel.propTypes = {
  label: PropTypes.string.isRequired,
  additionalInfo: PropTypes.string.isRequired,
};

function BrainRegionInput(props) {
  const { rois, roiInfo, onChange, value, classes, isMulti } = props;

  // transform rois into inputOptions.
  const inputOptions = rois.map(name => {
    let additionalInfo = '';
    if (roiInfo[name]) {
      additionalInfo = roiInfo[name].description;
    }

    return {
      label: name,
      value: name,
      additionalInfo
    };
  });

  const handleChange = (selectedOptions) => {
    onChange(selectedOptions);
  };

  const handlePaste = (event) => {
    const paste = (event.clipboardData || window.clipboardData).getData('text');
    const pastedItems = paste.split(/[\n,]/).map(item => item.trim()).filter(t => `${t}`.length > 0);

    // remove double or single quotes around the string.
    const unquotedItems = pastedItems
      .map(item => item.replace(/^"(.*)"$/, '$1'))
      .map(item => item.replace(/^'(.*)'$/, '$1'));

    // check if the string matches an existing ROI
    const filteredItems = unquotedItems.filter(item => rois.includes(item))

    const filteredOptions = filteredItems.map(name => {
      let additionalInfo = '';
      if (roiInfo[name]) {
        additionalInfo = roiInfo[name].description;
      }

      return {
        label: name,
        value: name,
        additionalInfo
      };

    });

    event.preventDefault();

    onChange(filteredOptions);
  };

  return (
    <Select
      components={{ Input: CustomInput }}
      className={classes.select}
      isMulti={isMulti}
      value={value}
      onChange={handleChange}
      onPaste={handlePaste}
      formatOptionLabel={formatOptionLabel}
      options={inputOptions}
      closeMenuOnSelect={false}
    />
  );
}

BrainRegionInput.propTypes = {
  rois: PropTypes.arrayOf(PropTypes.string).isRequired,
  roiInfo: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
  value: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.object),
    PropTypes.object
  ]),
  onChange: PropTypes.func.isRequired,
  isMulti: PropTypes.bool
};


BrainRegionInput.defaultProps = {
  isMulti: true,
  value: null
};

export default withStyles(styles)(BrainRegionInput);
