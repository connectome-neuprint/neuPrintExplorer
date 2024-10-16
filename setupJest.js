import merge from 'deepmerge';

global.submit = jest.fn();
global.fetch = require('jest-fetch-mock');

global.queryStringObject = {};
const overwriteMerge = (destinationArray, sourceArray) => sourceArray;

// these should match actions available in QueryForm.jsx in neuPrintExplorer
global.actions = {
  skeletonAddandOpen: jest.fn(),
  neuroglancerAddandOpen: jest.fn(),
  formError: jest.fn(),
  metaInfoError: jest.fn(),
  pluginResponseError: jest.fn(),
  getQueryString: jest.fn(),
  getSiteParams: jest.fn(),
  setQueryString: jest.fn(newData => {
    global.queryStringObject = merge(global.queryStringObject, newData, {
      arrayMerge: overwriteMerge
    });
  }),
  getQueryObject: jest.fn(plugin => {
    let queryObject = global.queryStringObject;
    if (plugin) {
      queryObject = queryObject[plugin];
    }
    return queryObject || {};
  })
};
