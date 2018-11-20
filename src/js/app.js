import AppReducers from './reducers';
import { Provider } from 'react-redux';
import React from 'react';
import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';

import Master from './components/Master.react';
import CssBaseline from '@material-ui/core/CssBaseline';
import { setAppDb } from './actions/app';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import loadPlugins from './helpers/initplugins';

var ReactDOM = require('react-dom');

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

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

// create redux store to handle app state
const store = createStore(AppReducers, {}, composeEnhancers(applyMiddleware(thunk)));

// include material UI font
var filename = 'https://fonts.googleapis.com/css?family=Roboto:300,400,50';
var fileref = document.createElement('link');
fileref.setAttribute('rel', 'stylesheet');
fileref.setAttribute('href', filename);
document.getElementsByTagName('head')[0].appendChild(fileref);

var filename2 = 'https://fonts.googleapis.com/icon?family=Material+Icons';
var fileref2 = document.createElement('link');
fileref2.setAttribute('rel', 'stylesheet');
fileref2.setAttribute('href', filename2);
document.getElementsByTagName('head')[0].appendChild(fileref2);

// load js hacks (TODO: make proper npm module for the sharkviewer)
var jssref = document.createElement('script');
jssref.setAttribute('src', '/external/SharkViewer/js/threejs/three.js');
document.getElementsByTagName('head')[0].appendChild(jssref);
jssref.onload = function() {
  var jssref2 = document.createElement('script');
  jssref2.setAttribute('src', '/external/SharkViewer/js/threejs/TrackballControls.js');
  document.getElementsByTagName('head')[0].appendChild(jssref2);
  var jssref3 = document.createElement('script');
  jssref3.setAttribute('src', '/external/SharkViewer/js/shark_viewer.js');
  document.getElementsByTagName('head')[0].appendChild(jssref3);
};

// load form plugins
loadPlugins(store);

// access global google datastore through the specified cloud function
var appDB = document.getElementById('analyzer').getAttribute('appdb');
store.dispatch(setAppDb(appDB));

/*
 * Load interface into a DIV anchored by analyzer.
*/
function loadInterface() {
  ReactDOM.render(
    <div>
      <CssBaseline />
      <MuiThemeProvider theme={theme}>
        <Provider store={store}>
          <Master />
        </Provider>
      </MuiThemeProvider>
    </div>,
    document.getElementById('analyzer')
  );
}

// render interface with dom loaded
if (window.addEventListener) {
  window.addEventListener('DOMContentLoaded', loadInterface);
} else {
  $(document).ready(loadInterface);
}
