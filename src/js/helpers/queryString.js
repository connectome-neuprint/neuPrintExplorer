import qs from 'qs';
import merge from 'deepmerge';
import Immutable from 'immutable';
import history from '../history';

/* the query string is a plain javacsript object converted into
 * a url safe string. The general structure is as follows:
 *
 * {
 *   dataSet: <string>, // the chosen dataset
 *   qt: <string>, // the currently chose plugin form
 *   q: 1, // is the query panel open or closed. Closed if this is missing.
 *   input: { // capture all the form state for each plugin
 *     <plugin-x>: {
 *       parameter1: <value>,
 *       parameter2: <value>,
 *     },
 *     <plugin-y: {}
 *   },
 *   queries: [ // capture the submitted queries.
 *     {
 *       dataSet: <string>,
 *       vizType: <string>,
 *     },
 *     {},
 *   ]
 * }
 */

const overwriteMerge = (destinationArray, sourceArray) => sourceArray;
const keywords = {
  true: true,
  false: false
};

export function getQueryString() {
  return window.location.search.substring(1);
}

export function getQueryObject(part) {
  let queryObject = qs.parse(decodeURIComponent(getQueryString()), {
    decoder(value) {
      if (value in keywords) {
        return keywords[value];
      }
      return value;
    }
  });
  if (part) {
    queryObject = queryObject[part];
  }
  return queryObject || {};
}

// This function limits the object returned to the plugins namespace
// The idea is to reduce the amount of work for plugin authors and to
// prevent them from overwriting core parameters.
export function getPluginQueryObject(plugin) {
  let queryObject = getQueryObject('plugins');
  if (plugin) {
    queryObject = queryObject[plugin];
  }
  return queryObject || {};
}

export function setQueryString(newData) {
  const currentQuery = qs.parse(decodeURIComponent(getQueryString()), {
    decoder(value) {
      if (value in keywords) {
        return keywords[value];
      }
      return value;
    }
  });
  const updatedData = merge(currentQuery, newData, { arrayMerge: overwriteMerge });
  const updatedQuery = qs.stringify(updatedData);
  history.push({
    pathname: window.location.pathname,
    search: updatedQuery
  });
}

// This function limits the setting of parameters to the plugins namespace
// The idea is to reduce the amount of work for plugin authors and to
// prevent them from overwriting core parameters.
export function setPluginQueryString(newData) {
  const plugins = {
    'plugins': newData
  };
  setQueryString(plugins);
}

export function getSiteParams(location) {
  const decoded =
    qs.parse(decodeURIComponent(location.search.substring(1)), {
      decoder(value) {
        if (value in keywords) {
          return keywords[value];
        }
        return value;
      }
    }) || {};
  return Immutable.fromJS(decoded);
}
