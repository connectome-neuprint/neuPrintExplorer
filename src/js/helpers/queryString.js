import qs from 'qs';
import history from '../history';
import merge from 'deepmerge';

const overwriteMerge = (destinationArray, sourceArray, options) => sourceArray;
const keywords = {
  true: true,
  false: false
};

export function getQueryString() {
  return window.location.search.substring(1);
}

export function getQueryObject() {
  return (
    qs.parse(decodeURIComponent(getQueryString()), {
      decoder: function(value) {
        if (value in keywords) {
          return keywords[value];
        }
        return value;
      }
    }) || {}
  );
}

export function setQueryString(newData) {
  const currentQuery = qs.parse(decodeURIComponent(getQueryString()), {
    decoder: function(value) {
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
