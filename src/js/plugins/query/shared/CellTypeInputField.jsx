import React from 'react';
import PropTypes from 'prop-types';
import AsyncSelect from 'react-select/async';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
  regexWarning: {
    fontSize: '0.9em'
  },
  select: {
    fontFamily: theme.typography.fontFamily,
    margin: '0.5em 0 1em 0'
  }
});

class CellTypeInputField extends React.Component {
  handleChange = selected => {
    const { onChange } = this.props;
    if (selected && selected.value) {
      onChange(selected.value);
    } else {
      onChange(selected);
    }
  };

  fetchOptions = inputValue => {
    const { dataSet } = this.props;

    // query neo4j
    const cypherString = `MATCH (neuron :Neuron)
    WHERE toLower(neuron.type) CONTAINS toLower('${inputValue}')
    RETURN neuron.type AS type
    ORDER BY neuron.type`;

    const body = JSON.stringify({
      cypher: cypherString,
      dataSet
    });

    const settings = {
      headers: {
        'content-type': 'application/json',
        Accept: 'application/json'
      },
      body,
      method: 'POST',
      credentials: 'include'
    };

    const queryUrl = '/api/custom/custom?np_explorer=cell_type_input';

    return fetch(queryUrl, settings)
      .then(result => result.json())
      .then(resp => {
        const types = new Set();

        resp.data.forEach(item => {
          types.add(item[0]);
        });

        const options = [];

        if (types.size) {
          options.push({
            label: 'Types',
            options: [...types]
              .sort()
              .slice(0, 9)
              .map(item => ({ value: item, label: item }))
          });
        }
        return options;
      });
  };

  render() {
    const { value, classes } = this.props;
    const selectValue = value ? { label: value, value } : null;
    return (
      <AsyncSelect
        name="cell_type_input"
        className={classes.select}
        classNamePrefix="asyncSelect"
        placeholder="Type or Paste text for options"
        value={selectValue}
        isClearable
        loadOptions={this.fetchOptions}
        onChange={this.handleChange}
      />
    );
  }
}

CellTypeInputField.propTypes = {
  classes: PropTypes.object.isRequired,
  onChange: PropTypes.func,
  dataSet: PropTypes.string.isRequired,
  value: PropTypes.string
};

CellTypeInputField.defaultProps = {
  onChange: () => {},
  value: ''
};

export default withStyles(styles)(CellTypeInputField);
