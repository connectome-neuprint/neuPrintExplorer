import qs from 'qs';
import merge from 'deepmerge';
import history from '../history';

const overwriteMerge = (destinationArray, sourceArray) => sourceArray;
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
      decoder(value) {
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
