import qs from 'qs';
import history from '../history';
import merge from 'deepmerge';

export function getQueryString() {
  return window.location.search.substring(1);
}

export function getQueryObject() {
  return qs.parse(getQueryString());
}

export function setQueryString(newData) {
  const currentQuery = qs.parse(window.location.search.substring(1));
  const updatedData = merge(currentQuery, newData);
  console.log(updatedData);
  const updatedQuery = qs.stringify(updatedData);
  history.push({
    pathname: window.location.pathname,
    search: updatedQuery,
  });
}
