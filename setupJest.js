import merge from 'deepmerge';
import { ThemeProvider, createTheme, adaptV4Theme } from '@mui/material/styles';
import { render } from '@testing-library/react';

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
  setQueryString: jest.fn((newData) => {
    global.queryStringObject = merge(global.queryStringObject, newData, {
      arrayMerge: overwriteMerge,
    });
  }),
  getQueryObject: jest.fn((plugin) => {
    let queryObject = global.queryStringObject;
    if (plugin) {
      queryObject = queryObject[plugin];
    }
    return queryObject || {};
  }),
};

const theme = createTheme(adaptV4Theme({
  typography: {
    useNextVariants: true
  },
  palette: {
    primary: {
      light: '#6595c8',
      main: '#396a9f',
      dark: '#1e3854',
      contrastText: '#ffffff'
    },
    secondary: {
      light: '#ceff76',
      main: '#9adb43',
      dark: '#67a900',
      contrastText: '#000000'
    }
  }
}));

console.log('setting up custom render');

const customRender = (ui, options) =>
  render(ui, {
    wrapper: ({ children }) => <ThemeProvider theme={theme}>{children}</ThemeProvider>,
    ...options,
  });

global.render = customRender;
