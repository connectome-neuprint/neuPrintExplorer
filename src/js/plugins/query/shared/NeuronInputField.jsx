import React from 'react';
import PropTypes from 'prop-types';
import AsyncSelect from 'react-select/async';
import InputLabel from '@mui/material/InputLabel';
import withStyles from '@mui/styles/withStyles';


const styles = theme => ({
  regexWarning: {
    fontSize: '0.9em'
  },
  select: {
    fontFamily: theme.typography.fontFamily,
    margin: '0.5em 0 1em 0'
  }
});

function truncateString(str, n, useWordBoundary) {
  if (typeof str !== 'string') {
    return str;
  }

  if (str.length <= n) {
    return str;
  }
  const subString = str.substr(0, n - 1); // the original check
  if (useWordBoundary) {
    return `${subString.substr(0, subString.lastIndexOf(' '))}...`;
  }
  return `${subString}&hellip;`;
}

function formatOptionLabel({ label, additionalInfo }) {
  return (
    <div style={{ display: 'flex' }}>
      <div>{label}</div>
      <div style={{ marginLeft: '10px', color: '#ccc' }}>{additionalInfo}</div>
    </div>
  );
}

formatOptionLabel.propTypes = {
  label: PropTypes.string.isRequired,
  additionalInfo: PropTypes.string.isRequired
};

class NeuronInputField extends React.Component {
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

    let bodyId = -1;

    if (!Number.isNaN(inputValue)) {
      bodyId = inputValue;
    }

    const cypherString = `WITH
    toLower('${inputValue}') as q,
    '${bodyId}' as user_body
MATCH (n :Neuron)
WHERE
    n.bodyId = user_body
    OR toLower(n.type) CONTAINS q
    OR toLower(n.instance) CONTAINS q
    OR toLower(n.notes) CONTAINS q
WITH n,
    // Assign a match score according to where the match occurs within the properties.
    CASE WHEN
        n.bodyId = user_body
        THEN 0
    ELSE CASE WHEN
            // Exact match
            toLower(n.type) = q
            OR toLower(n.instance) = q
        THEN 1
    ELSE CASE WHEN
            // Parenthesized exact match
            toLower(n.type) = '(${inputValue.toLowerCase()})'
            OR toLower(n.instance) =~ '(${inputValue.toLowerCase()}).*'
        THEN 2
    ELSE CASE WHEN
            // Exact prefix
            toLower(n.type) =~ '(^${inputValue.toLowerCase()}.*)'
            OR toLower(n.instance) =~ '(^${inputValue.toLowerCase()}.*)'
        THEN 3
    ELSE CASE WHEN
            // Parenthesized exact prefix
            toLower(n.type) =~ '(^\\\\(${inputValue.toLowerCase()}.*)'
            OR toLower(n.instance) =~ '(^\\\\(${inputValue.toLowerCase()}.*)'
        THEN 4
    ELSE CASE WHEN
            // Any match in type or instance
            toLower(n.type) CONTAINS q
            OR toLower(n.instance) CONTAINS q
        THEN 5
    // Lastly, matches in notes
    ELSE 6
    END END END END END END as priority
RETURN
    toString(n.bodyId) AS bodyid,
    n.type AS type,
    n.instance AS instance,
    n.notes AS notes
ORDER BY priority, n.type, n.instance`

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

    const queryUrl = '/api/custom/custom?np_explorer=neuron_input_field';

    return fetch(queryUrl, settings)
      .then(result => result.json())
      .then(resp => {
        // sort the results in the data key. Need to split out instances, types
        // and bodyids into separate categories then load them in different
        // sections of the drop down.

        const bodyIds = new Set();
        const types = new Set();
        const instances = new Set();

        const bodyIdLabels = {};
        const instanceLabels = {};

        resp.data.forEach(item => {
          if (item[0]) {
            bodyIds.add(item[0].toString());
            bodyIdLabels[item[0]] = `${item[2] || item[1] || ''}`;
          }
          if (item[1]) {
            if (item[1].toLowerCase().includes(inputValue.toLowerCase())) {
              types.add(item[1]);
            }
          }
          // if this is an instance, then also show the type and notes (item[3])
          if (item[2]) {
            instances.add(item[2]);
            instanceLabels[item[2]] = `${item[1] || item[0] || ''} ${truncateString(
              item[3],
              25,
              true
            ) || ''}`;
          }
        });

        const options = [];

        if (types.size) {
          options.push({
            label: 'Types',
            options: [...types]
              .slice(0, 10)
              .map(item => ({ value: item, label: item }))
          });
        }
        if (instances.size) {
          options.push({
            label: 'Instances',
            options: [...instances]
              .slice(0, 10)
              .map(item => ({ value: item, label: item, additionalInfo: instanceLabels[item] }))
          });
        }
        if (bodyIds.size) {
          options.push({
            label: 'Body Ids',
            options: [...bodyIds]
              .slice(0, 10)
              .map(item => ({ value: item, label: item, additionalInfo: bodyIdLabels[item] }))
          });
        }

        return options;
      });
  };

  render() {
    const { value, classes } = this.props;
    const selectValue = value ? { label: value, value } : null;
    return (
      <>
        <InputLabel htmlFor="select-multiple-chip">
          Neuron Instance, Type or BodyId (optional)
        </InputLabel>
        <AsyncSelect
          className={classes.select}
          classNamePrefix="asyncSelect"
          formatOptionLabel={formatOptionLabel}
          placeholder="Type or Paste text for options"
          value={selectValue}
          isClearable
          loadOptions={this.fetchOptions}
          onChange={this.handleChange}
        />
      </>
    );
  }
}

NeuronInputField.propTypes = {
  classes: PropTypes.object.isRequired,
  onChange: PropTypes.func,
  dataSet: PropTypes.string.isRequired,
  value: PropTypes.string
};

NeuronInputField.defaultProps = {
  onChange: () => {},
  value: ''
};

export default withStyles(styles)(NeuronInputField);
