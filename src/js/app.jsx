import { Provider } from 'react-redux';
import React from 'react';
import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';

import CssBaseline from '@material-ui/core/CssBaseline';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import { CookiesProvider } from 'react-cookie';

import Master from './components/Master';
import { setAppDb } from './actions/app';
import AppReducers from './reducers';
import loadPlugins from './helpers/initplugins';

const ReactDOM = require('react-dom');

// set theme colors
const theme = createMuiTheme({
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
});

// eslint-disable-next-line  no-underscore-dangle
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

// TODO: if there is an identifier in the url to indicate that the state has been
// stored somewhere, then we should fetch that state, deserialize it and use it to
// populate the store.
// TODO: what should the identifier be called?
// TODO: add a button to allow people to pull the current state from the store and save it.
// create redux store to handle app state
const store = createStore(AppReducers, {}, composeEnhancers(applyMiddleware(thunk)));

// include material UI font
const filename = 'https://fonts.googleapis.com/css?family=Roboto:300,400,50';
const fileref = document.createElement('link');
fileref.setAttribute('rel', 'stylesheet');
fileref.setAttribute('href', filename);
document.getElementsByTagName('head')[0].appendChild(fileref);

const filename2 = 'https://fonts.googleapis.com/icon?family=Material+Icons';
const fileref2 = document.createElement('link');
fileref2.setAttribute('rel', 'stylesheet');
fileref2.setAttribute('href', filename2);
document.getElementsByTagName('head')[0].appendChild(fileref2);

// load form plugins
loadPlugins(store);

// access global google datastore through the specified cloud function
const appDB = document.getElementById('analyzer').getAttribute('appdb');
store.dispatch(setAppDb(appDB));

/*
 * Load interface into a DIV anchored by analyzer.
 */
function loadInterface() {
  ReactDOM.render(
    <React.Fragment>
      <CssBaseline />
      <CookiesProvider>
        <ThemeProvider theme={theme}>
          <Provider store={store}>
            <Master />
          </Provider>
        </ThemeProvider>
      </CookiesProvider>
    </React.Fragment>,
    document.getElementById('analyzer')
  );
}

// render interface with dom loaded
if (window.addEventListener) {
  window.addEventListener('DOMContentLoaded', loadInterface);
} else {
  $(document).ready(loadInterface);
}
