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

// The fulltext index buildFastQuery depends on. A dataset without it cannot
// serve that query at all -- db.index.fulltext.queryNodes throws
// IllegalArgumentException rather than returning no rows -- so
// checkFulltextSupport() below looks for it by name before enabling the query.
const FULLTEXT_INDEX_NAME = 'find_neurons_fulltext_properties_index';

function buildFastQuery(inputValue, bodyId) {
  return `WITH toLower('${inputValue}') as q, ${bodyId} as user_body

// Full-text search wrapped in subquery to preserve pipeline when no results
CALL {
  WITH q
  CALL db.index.fulltext.queryNodes('${FULLTEXT_INDEX_NAME}', '*' + q + '*')
  YIELD node as n
  RETURN collect(n) as textMatches
}

// Add bodyId match if specified.
//
// The aggregation is deliberately split across two WITH clauses. Combining
// collect(b) with the 'textMatches + ...' expression in a single clause makes
// textMatches an implicit grouping key; Cypher 4.4 accepted that, and Cypher 5
// rejects it (42I18). Splitting it aggregates first, then adds the lists, which
// both language versions accept.
OPTIONAL MATCH (b:Neuron) WHERE user_body <> 0 AND b.bodyId = user_body
WITH textMatches, q, user_body, collect(b) as bodyMatches
WITH textMatches + bodyMatches as allMatches, q, user_body
UNWIND allMatches as n

WITH DISTINCT n, q, user_body,
     [toLower(n.type), toLower(n.instance), toLower(n.hemibrainType),
      toLower(n.flywireType), toLower(n.systematicType), toLower(n.itoleeHl),
      toLower(n.trumanHl), toLower(n.synonyms), toLower(n.class),
      toLower(n.entryNerve), toLower(n.exitNerve)] as props
WITH n, q, props, user_body,
     CASE
         WHEN n.bodyId = user_body AND user_body <> 0 THEN 0
         WHEN any(p IN props WHERE p = q) THEN 1
         WHEN any(p IN props WHERE p STARTS WITH q) THEN 2
         WHEN any(p IN props WHERE p STARTS WITH '(' + q) THEN 3
         WHEN any(p IN props WHERE p CONTAINS q) THEN 4
         ELSE 5
     END as priority,
     CASE
         WHEN toLower(n.type) STARTS WITH q THEN 0
         WHEN toLower(n.type) CONTAINS q THEN 1
         ELSE 2
     END as type_priority
RETURN
    toString(n.bodyId) as bodyId,
    n.type as type,
    n.instance as instance,
    n.hemibrainType as hemibrainType,
    n.flywireType as flywireType,
    n.systematicType as systematicType,
    n.itoleeHl as itoLeeHl,
    n.trumanHl as trumanHl,
    n.synonyms as synonyms,
    n.class as class,
    n.entryNerve as entryNerve,
    n.exitNerve as exitNerve,
    priority,
    type_priority
ORDER BY priority, type_priority, n.type, n.instance`;
}

function buildSlowQuery(inputValue, bodyId) {
  return `WITH toLower('${inputValue}') as q, ${bodyId} as user_body, '(' + toLower('${inputValue}') as parenQ
MATCH (n:Neuron)
WHERE n.bodyId = user_body
   OR any(prop IN [
       n.type, n.instance, n.hemibrainType, n.flywireType,
       n.systematicType, n.itoleeHl, n.trumanHl, n.synonyms,
       n.class, n.entryNerve, n.exitNerve
   ] WHERE toLower(prop) CONTAINS q)
WITH n, q, parenQ, user_body,
     [toLower(n.type), toLower(n.instance), toLower(n.hemibrainType),
      toLower(n.flywireType), toLower(n.systematicType), toLower(n.itoleeHl),
      toLower(n.trumanHl), toLower(n.synonyms), toLower(n.class),
      toLower(n.entryNerve), toLower(n.exitNerve)] as props
WITH n, q, parenQ, props, user_body,
     CASE
         WHEN n.bodyId = user_body AND user_body <> 0 THEN 0
         WHEN any(p IN props WHERE p = q) THEN 1
         WHEN any(p IN props WHERE p STARTS WITH q) THEN 2
         WHEN any(p IN props WHERE p STARTS WITH parenQ) THEN 3
         WHEN any(p IN props WHERE p CONTAINS q) THEN 4
         ELSE 5
     END as priority,
     CASE
         WHEN toLower(n.type) STARTS WITH q THEN 0
         WHEN toLower(n.type) CONTAINS q THEN 1
         ELSE 2
     END as type_priority
RETURN
    toString(n.bodyId) as bodyId,
    n.type as type,
    n.instance as instance,
    n.hemibrainType as hemibrainType,
    n.flywireType as flywireType,
    n.systematicType as systematicType,
    n.itoleeHl as itoLeeHl,
    n.trumanHl as trumanHl,
    n.synonyms as synonyms,
    n.class as class,
    n.entryNerve as entryNerve,
    n.exitNerve as exitNerve,
    priority,
    type_priority
ORDER BY priority, type_priority, n.type, n.instance`;
}

function runCypher(dataSet, cypher) {
  return fetch('/api/custom/custom?np_explorer=neuron_input_field', {
    headers: {
      'content-type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ cypher, dataSet }),
    method: 'POST',
    credentials: 'include',
  }).then((result) => result.json());
}

class NeuronInputField extends React.Component {
  constructor(props) {
    super(props);
    this.debounceTimer = null;
    this.state = {
      useFastQuery: false,
    };
  }

  componentDidMount() {
    this.checkFulltextSupport();
  }

  checkFulltextSupport() {
    const { dataSet } = this.props;

    // Pinned to the kernel row: on the CalVer line dbms.components() returns a
    // second row for Cypher (versions ["5", "25"]), so reading the first row
    // blind depends on row order rather than on asking for what we mean.
    const versionCypher = `CALL dbms.components() YIELD name, versions
WITH name, versions WHERE name = 'Neo4j Kernel'
RETURN versions[0] as version`;

    runCypher(dataSet, versionCypher)
      .then((resp) => {
        if (!resp.data || !resp.data[0]) {
          return null;
        }
        const version = resp.data[0][0];
        // 4.4 is the floor because buildFastQuery uses a CALL {} subquery,
        // which 3.5 cannot parse. parseFloat yields 3.5 for '3.5.3' and 2026
        // for '2026.08.1', so both ends of the deployed fleet classify right.
        if (parseFloat(version) < 4.4) {
          return null;
        }

        // SHOW INDEXES, not db.indexes(): that procedure was removed in Neo4j
        // 5.0, so against a 5.x or CalVer server the old call threw, the catch
        // below swallowed it, and the fast query was silently never used --
        // correct results, but permanently on the slow path. SHOW INDEXES is
        // accepted by 4.4 and every later version alike.
        const indexCypher = `SHOW INDEXES YIELD name, state
WHERE name = '${FULLTEXT_INDEX_NAME}'
RETURN state`;

        return runCypher(dataSet, indexCypher).then((indexResp) => {
          const state = indexResp.data && indexResp.data[0] && indexResp.data[0][0];
          // Require ONLINE: a POPULATING index answers queries with partial
          // results, which would drop matches with no error anywhere.
          if (state === 'ONLINE') {
            this.setState({ useFastQuery: true });
          }
        });
      })
      .catch(() => {
        // Any failure leaves useFastQuery false, which is the safe direction:
        // buildSlowQuery returns the same rows without needing the index.
      });
  }

  handleChange = (selected) => {
    const { onChange } = this.props;
    if (selected && selected.value) {
      onChange(selected.value, selected.field || null);
    } else {
      onChange(selected, null);
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
    const { useFastQuery } = this.state;

    let bodyId = -1;
    if (/^\d+$/.test(inputValue)) {
      bodyId = inputValue;
    }

    const cypherString = useFastQuery
      ? buildFastQuery(inputValue, bodyId)
      : buildSlowQuery(inputValue, bodyId);

    return runCypher(dataSet, cypherString).then((resp) => {
      // Both queries return rows with:
      // [bodyId, type, instance, hemibrainType, flywireType, systematicType,
      //  itoLeeHl, trumanHl, synonyms, class, entryNerve, exitNerve, priority, type_priority]

      const uniqueValues = {
        bodyIds: new Set(),
        types: new Set(),
        instances: new Set(),
        hemibrainTypes: new Set(),
        flywireTypes: new Set(),
        systematicTypes: new Set(),
        itoLeeHlValues: new Set(),
        trumanHlValues: new Set(),
        synonyms: new Set(),
        classes: new Set(),
        entryNerves: new Set(),
        exitNerves: new Set(),
      };

      const additionalInfo = new Map();

      resp.data.forEach((item) => {
        const [
          bodyId,
          type,
          instance,
          hemibrainType,
          flywireType,
          systematicType,
          itoLeeHl,
          trumanHl,
          synonyms,
          neuronClass,
          entryNerve,
          exitNerve,
        ] = item;

        const lowerInput = inputValue.toLowerCase();

        const matchedInRelevantFields = [
          bodyId && bodyId.toString().toLowerCase().includes(lowerInput),
          type && type.toLowerCase().includes(lowerInput),
          instance && instance.toLowerCase().includes(lowerInput),
          hemibrainType && hemibrainType.toLowerCase().includes(lowerInput),
          flywireType && flywireType.toLowerCase().includes(lowerInput),
          systematicType && systematicType.toLowerCase().includes(lowerInput),
          itoLeeHl && itoLeeHl.toLowerCase().includes(lowerInput),
          trumanHl && trumanHl.toLowerCase().includes(lowerInput),
          neuronClass && neuronClass.toLowerCase().includes(lowerInput),
          entryNerve && entryNerve.toLowerCase().includes(lowerInput),
          exitNerve && exitNerve.toLowerCase().includes(lowerInput),
        ].some((matched) => matched);

        if (bodyId && matchedInRelevantFields) {
          uniqueValues.bodyIds.add(bodyId);
          additionalInfo.set(bodyId, instance || type || '');
        }

        if (type && matchedInRelevantFields) {
          uniqueValues.types.add(type);
        }

        if (instance && matchedInRelevantFields) {
          uniqueValues.instances.add(instance);
          additionalInfo.set(instance, type || '');
        }

        if (hemibrainType && hemibrainType.toLowerCase().includes(lowerInput)) {
          uniqueValues.hemibrainTypes.add(hemibrainType);
        }

        if (flywireType && flywireType.toLowerCase().includes(lowerInput)) {
          uniqueValues.flywireTypes.add(flywireType);
        }

        if (systematicType && systematicType.toLowerCase().includes(lowerInput)) {
          uniqueValues.systematicTypes.add(systematicType);
        }

        if (itoLeeHl && itoLeeHl.toLowerCase().includes(lowerInput)) {
          uniqueValues.itoLeeHlValues.add(itoLeeHl);
        }

        if (trumanHl && trumanHl.toLowerCase().includes(lowerInput)) {
          uniqueValues.trumanHlValues.add(trumanHl);
        }

        if (synonyms && synonyms.toLowerCase().includes(lowerInput)) {
          uniqueValues.synonyms.add(synonyms);
        }

        if (neuronClass && neuronClass.toLowerCase().includes(lowerInput)) {
          uniqueValues.classes.add(neuronClass);
        }

        if (entryNerve && entryNerve.toLowerCase().includes(lowerInput)) {
          uniqueValues.entryNerves.add(entryNerve);
        }

        if (exitNerve && exitNerve.toLowerCase().includes(lowerInput)) {
          uniqueValues.exitNerves.add(exitNerve);
        }
      });

      const options = [];

      const setToOptions = (set, field, limit = 10, showAdditionalInfo = false) => {
        return [...set].slice(0, limit).map((value) => ({
          value,
          label: value,
          field,
          additionalInfo: showAdditionalInfo ? additionalInfo.get(value) || '' : '',
        }));
      };

      if (uniqueValues.types.size > 0) {
        options.push({
          label: 'Types',
          options: setToOptions(uniqueValues.types, 'type', 10, false),
        });
      }

      if (uniqueValues.instances.size > 0) {
        options.push({
          label: 'Instances',
          options: setToOptions(uniqueValues.instances, 'instance', 10, true),
        });
      }

      if (uniqueValues.hemibrainTypes.size > 0) {
        options.push({
          label: 'Hemibrain Types',
          options: setToOptions(uniqueValues.hemibrainTypes, 'hemibrainType', 10, false),
        });
      }

      if (uniqueValues.flywireTypes.size > 0) {
        options.push({
          label: 'Flywire Types',
          options: setToOptions(uniqueValues.flywireTypes, 'flywireType', 10, false),
        });
      }

      if (uniqueValues.systematicTypes.size > 0) {
        options.push({
          label: 'Systematic Types',
          options: setToOptions(uniqueValues.systematicTypes, 'systematicType', 10, false),
        });
      }

      if (uniqueValues.itoLeeHlValues.size > 0) {
        options.push({
          label: 'Ito-Lee Hemilineage',
          options: setToOptions(uniqueValues.itoLeeHlValues, 'itoleeHl', 10, false),
        });
      }

      if (uniqueValues.trumanHlValues.size > 0) {
        options.push({
          label: 'Truman Hemilineage',
          options: setToOptions(uniqueValues.trumanHlValues, 'trumanHl', 10, false),
        });
      }

      if (uniqueValues.classes.size > 0) {
        options.push({
          label: 'Classes',
          options: setToOptions(uniqueValues.classes, 'class', 10, false),
        });
      }

      if (uniqueValues.entryNerves.size > 0) {
        options.push({
          label: 'Entry Nerves',
          options: setToOptions(uniqueValues.entryNerves, 'entryNerve', 10, false),
        });
      }

      if (uniqueValues.exitNerves.size > 0) {
        options.push({
          label: 'Exit Nerves',
          options: setToOptions(uniqueValues.exitNerves, 'exitNerve', 10, false),
        });
      }

      if (uniqueValues.bodyIds.size > 0) {
        options.push({
          label: 'Body IDs',
          options: setToOptions(uniqueValues.bodyIds, 'bodyId', 10, true),
        });
      }

      if (uniqueValues.synonyms.size > 0) {
        options.push({
          label: 'Synonyms',
          options: setToOptions(uniqueValues.synonyms, 'synonyms', 10, false),
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
