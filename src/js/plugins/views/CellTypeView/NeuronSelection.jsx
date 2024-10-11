/* eslint-disable no-nested-ternary */
import React from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select';
// eslint-disable-next-line import/no-unresolved
import chroma from 'chroma-js';

const dot = (color = '#ccc') => ({
  alignItems: 'center',
  display: 'flex',

  ':before': {
    backgroundColor: color,
    borderRadius: 10,
    content: '" "',
    display: 'block',
    marginRight: 8,
    height: 10,
    width: 10
  }
});

const reference = '#43a047';
const notTrusted = '#ef5350';

const colorStyles = {
  control: styles => ({ ...styles, backgroundColor: 'white' }),
  option: (styles, { data, isDisabled, isFocused, isSelected }) => {
    const color = chroma(data.color);
    return {
      ...styles,
      backgroundColor: isDisabled
        ? null
        : isSelected
        ? data.color
        : isFocused
        ? color.alpha(0.1).css()
        : null,
      color: isDisabled
        ? '#ccc'
        : isSelected
        ? chroma.contrast(color, 'white') > 2
          ? 'white'
          : 'black'
        : data.color,
      cursor: isDisabled ? 'not-allowed' : 'default',

      ':active': {
        ...styles[':active'],
        backgroundColor: !isDisabled && (isSelected ? data.color : color.alpha(0.3).css())
      }
    };
  },
  input: styles => ({ ...styles, ...dot() }),
  placeholder: styles => ({ ...styles, ...dot() }),
  singleValue: (styles, { data }) => ({ ...styles, ...dot(data.color) })
};

export default function NeuronSelection(props) {
  const { neuronInfo, exemplarId, onChange } = props;

  const bodyIds = Object.keys(neuronInfo).map(item => {
    const label = `${item} - ${neuronInfo[item]['instance-name']}`;
    return {
      value: item,
      label,
      color: neuronInfo[item].reference ? reference : notTrusted
    };
  });

  const color = neuronInfo[exemplarId].reference ? reference : notTrusted;
  const selectedLabel = `${exemplarId} - ${neuronInfo[exemplarId]['instance-name']}`;

  return (
    <Select
      name="exemplarSelect"
      options={bodyIds}
      onChange={onChange}
      value={{ value: exemplarId, label: selectedLabel, color }}
      styles={colorStyles}
    />
  );
}

NeuronSelection.propTypes = {
  neuronInfo: PropTypes.object.isRequired,
  exemplarId: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired
};
