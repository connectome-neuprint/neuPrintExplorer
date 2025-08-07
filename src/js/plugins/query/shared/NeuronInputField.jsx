import React from 'react';
import PropTypes from 'prop-types';
import AsyncSelect from 'react-select/async';
import InputLabel from '@mui/material/InputLabel';
import withStyles from '@mui/styles/withStyles';

const styles = (theme) => ({
  select: {
    fontFamily: theme.typography.fontFamily,
    margin: '0.5em 0 1em 0',
  },
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
  additionalInfo: PropTypes.string.isRequired,
};

class NeuronInputField extends React.Component {
  constructor(props) {
    super(props);
    this.debounceTimer = null;
  }

  handleChange = (selected) => {
    const { onChange } = this.props;
    if (selected && selected.value) {
      onChange(selected.value);
    } else {
      onChange(selected);
    }
  };

  fetchOptions = (inputValue) => {
    return new Promise((resolve) => {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => {
        this.fetchOptionsImmediate(inputValue)
          .then(resolve)
          .catch(() => resolve([]));
      }, 300);
    });
  };

  fetchOptionsImmediate = (inputValue) => {
    const { dataSet } = this.props;

    // If the input value is a number, then use it as the bodyId, if not
    // then set the bodyId -1 to prevent it from matching anything in
    // the database, but keep the cypher query valid.
    let bodyId = -1;
    if (/^\d+$/.test(inputValue)) {
      bodyId = inputValue;
    }

    const cypherString = `
WITH toLower('${inputValue}') as q, ${bodyId} as user_body
MATCH (n:Neuron)
WHERE
    n.bodyId = user_body
    OR toLower(n.type) CONTAINS q
    OR toLower(n.hemibrainType) CONTAINS q
    OR toLower(n.flywireType) CONTAINS q
    OR toLower(n.systematicType) CONTAINS q
    OR toLower(n.synonyms) CONTAINS q
    OR toLower(n.instance) CONTAINS q
WITH n,
    // Assign a match score according to where the match occurs within the properties.
    CASE WHEN
        n.bodyId = user_body
        THEN 0
    ELSE CASE WHEN
            // Exact match
            toLower(n.type) = q
            OR toLower(n.instance) = q
            OR toLower(n.hemibrainType) = q
            OR toLower(n.flywireType) = q
            OR toLower(n.systematicType) = q
            OR toLower(n.synonyms) = q
        THEN 1
    ELSE CASE WHEN
            // Parenthesized exact match
            toLower(n.type) = '(${inputValue.toLowerCase()})'
            OR toLower(n.instance) =~ '(${inputValue.toLowerCase()}).*'
            OR toLower(n.hemibrainType) = '(${inputValue.toLowerCase()})'
            OR toLower(n.flywireType) = '(${inputValue.toLowerCase()})'
            OR toLower(n.systematicType) = '(${inputValue.toLowerCase()})'
            OR toLower(n.synonyms) = '(${inputValue.toLowerCase()})'
        THEN 2
    ELSE CASE WHEN
            // Exact prefix
            toLower(n.type) =~ '(^${inputValue.toLowerCase()}.*)'
            OR toLower(n.instance) =~ '(^${inputValue.toLowerCase()}.*)'
            OR toLower(n.hemibrainType) =~ '(^${inputValue.toLowerCase()}.*)'
            OR toLower(n.flywireType) =~ '(^${inputValue.toLowerCase()}.*)'
            OR toLower(n.systematicType) =~ '(^${inputValue.toLowerCase()}.*)'
            OR toLower(n.synonyms) =~ '(^${inputValue.toLowerCase()}.*)'
        THEN 3
    ELSE CASE WHEN
            // Parenthesized exact prefix
            toLower(n.type) =~ '(^\\\\(${inputValue.toLowerCase()}.*)'
            OR toLower(n.instance) =~ '(^\\\\(${inputValue.toLowerCase()}.*)'
            OR toLower(n.hemibrainType) =~ '(^\\\\(${inputValue.toLowerCase()}.*)'
            OR toLower(n.flywireType) =~ '(^\\\\(${inputValue.toLowerCase()}.*)'
            OR toLower(n.systematicType) =~ '(^\\\\(${inputValue.toLowerCase()}.*)'
            OR toLower(n.synonyms) =~ '(^\\\\(${inputValue.toLowerCase()}.*)'
        THEN 4
    ELSE CASE WHEN
            // Any match in type, instance, or other fields
            toLower(n.type) CONTAINS q
            OR toLower(n.instance) CONTAINS q
            OR toLower(n.hemibrainType) CONTAINS q
            OR toLower(n.flywireType) CONTAINS q
            OR toLower(n.systematicType) CONTAINS q
            OR toLower(n.synonyms) CONTAINS q
        THEN 5
    ELSE 6
    END END END END END END as priority,
    CASE
        WHEN toLower(n.type) =~ ('(?i)^' + q + '.*') THEN 0
        WHEN toLower(n.type) CONTAINS q THEN 1
        ELSE 2
    END AS type_priority
RETURN DISTINCT
    toString(n.bodyId) as bodyId,
    n.type as type,
    n.instance as instance,
    n.hemibrainType as hemibrainType,
    n.flywireType as flywireType,
    n.systematicType as systematicType,
    n.synonyms as synonyms,
    priority,
    type_priority
ORDER BY priority, type_priority, n.type, n.instance
`;

    const body = JSON.stringify({
      cypher: cypherString,
      dataSet,
    });

    const settings = {
      headers: {
        'content-type': 'application/json',
        Accept: 'application/json',
      },
      body,
      method: 'POST',
      credentials: 'include',
    };

    const queryUrl = '/api/custom/custom?np_explorer=neuron_input_field';

    return fetch(queryUrl, settings)
      .then((result) => result.json())
      .then((resp) => {
        // Process the simplified query format where each row contains all neuron properties:
        // [bodyId, type, instance, hemibrainType, flywireType, systematicType, synonyms, priority, type_priority]

        const uniqueValues = {
          bodyIds: new Set(),
          types: new Set(),
          instances: new Set(),
          hemibrainTypes: new Set(),
          flywireTypes: new Set(),
          systematicTypes: new Set(),
          synonyms: new Set(),
        };

        const additionalInfo = new Map();

        resp.data.forEach((item) => {
          const [bodyId, type, instance, hemibrainType, flywireType, systematicType, synonyms, priority, type_priority] =
            item;

          // Collect unique values for each field
          if (bodyId) {
            uniqueValues.bodyIds.add(bodyId);
            // For body IDs, show instance or type as additional info
            additionalInfo.set(bodyId, instance || type || '');
          }

          if (type) {
            uniqueValues.types.add(type);
          }

          if (instance) {
            uniqueValues.instances.add(instance);
            // For instances, show type as additional info
            additionalInfo.set(instance, type || '');
          }

          if (hemibrainType && hemibrainType.toLowerCase().includes(inputValue.toLowerCase())) {
            uniqueValues.hemibrainTypes.add(hemibrainType);
          }

          if (flywireType && flywireType.toLowerCase().includes(inputValue.toLowerCase())) {
            uniqueValues.flywireTypes.add(flywireType);
          }

          if (systematicType && systematicType.toLowerCase().includes(inputValue.toLowerCase())) {
            uniqueValues.systematicTypes.add(systematicType);
          }

          if (synonyms && synonyms.toLowerCase().includes(inputValue.toLowerCase())) {
            uniqueValues.synonyms.add(synonyms);
          }
        });

        const options = [];

        // Helper function to convert Set to options array
        const setToOptions = (set, limit = 10, showAdditionalInfo = false) => {
          return [...set].slice(0, limit).map((value) => ({
            value: value,
            label: value,
            additionalInfo: showAdditionalInfo ? additionalInfo.get(value) || '' : '',
          }));
        };

        // Add option groups in requested order: Types, Instances, Hemibrain Types, Flywire Types, Systematic Types, Body IDs, Synonyms
        if (uniqueValues.types.size > 0) {
          options.push({
            label: 'Types',
            options: setToOptions(uniqueValues.types, 10, false),
          });
        }

        if (uniqueValues.instances.size > 0) {
          options.push({
            label: 'Instances',
            options: setToOptions(uniqueValues.instances, 10, true),
          });
        }

        if (uniqueValues.hemibrainTypes.size > 0) {
          options.push({
            label: 'Hemibrain Types',
            options: setToOptions(uniqueValues.hemibrainTypes, 10, false),
          });
        }

        if (uniqueValues.flywireTypes.size > 0) {
          options.push({
            label: 'Flywire Types',
            options: setToOptions(uniqueValues.flywireTypes, 10, false),
          });
        }

        if (uniqueValues.systematicTypes.size > 0) {
          options.push({
            label: 'Systematic Types',
            options: setToOptions(uniqueValues.systematicTypes, 10, false),
          });
        }

        if (uniqueValues.bodyIds.size > 0) {
          options.push({
            label: 'Body IDs',
            options: setToOptions(uniqueValues.bodyIds, 10, true),
          });
        }

        if (uniqueValues.synonyms.size > 0) {
          options.push({
            label: 'Synonyms',
            options: setToOptions(uniqueValues.synonyms, 10, false),
          });
        }

        return options;
      });
  };

  componentWillUnmount() {
    clearTimeout(this.debounceTimer);
  }

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
          inputId="search-neuron-input"
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
  value: PropTypes.string,
};

NeuronInputField.defaultProps = {
  onChange: () => {},
  value: '',
};

export default withStyles(styles)(NeuronInputField);
