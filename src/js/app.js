"use strict";

//var AppReducers = require('./reducers');

import AppReducers from './reducers';
var Redux = require('redux');
var ReactDOM = require('react-dom');

import {Provider} from 'react-redux';
import React from 'react';
import Master from "./components/Master.react";
import styles1 from '../css/grid.min.css';
import styles2 from '../css/resize.min.css';
import CssBaseline from 'material-ui/CssBaseline';
import C from "./reducers/constants";

// set theme colors
import { MuiThemeProvider, createMuiTheme } from 'material-ui/styles';
const theme = createMuiTheme({
  palette: {
    primary: {
      light: '#4ca8b1',
      main: '#017982',
      dark: '#004d55',
      contrastText: '#ffffff',
    },
    secondary: {
      light: '#ceff76',
      main: '#9adb43',
      dark: '#67a900',
      contrastText: '#000000',
    },
  },
});

// create redux store to handle app state
var store = Redux.createStore(AppReducers);

/* Bootstrap specific (disabled)
// load css that contains bootstrap
var filename = "css/main.min.css";
var fileref = document.createElement("link");
fileref.setAttribute("rel", "stylesheet");
fileref.setAttribute("type", "text/css");
fileref.setAttribute("href", filename);
document.getElementsByTagName("head")[0].appendChild(fileref);

// load jquery
window.$ = window.jQuery = require('jquery');

// this bundle version includes the correct version of Popper
import '../../node_modules/bootstrap/dist/js/bootstrap.bundle.js'
*/

//<link href="https://fonts.googleapis.com/css?family=Roboto:300,400,500" rel="stylesheet">

// include material UI font
var filename = "https://fonts.googleapis.com/css?family=Roboto:300,400,50";
var fileref = document.createElement("link");
fileref.setAttribute("rel", "stylesheet");
fileref.setAttribute("href", filename);
document.getElementsByTagName("head")[0].appendChild(fileref);

var filename2 = "https://fonts.googleapis.com/icon?family=Material+Icons";
var fileref2 = document.createElement("link");
fileref2.setAttribute("rel", "stylesheet");
fileref2.setAttribute("href", filename2);
document.getElementsByTagName("head")[0].appendChild(fileref2);

// load css files
//var css1 = "css/grid.min.css";
var css1ref = document.createElement("link");
css1ref.setAttribute("rel", "stylesheet");
css1ref.setAttribute("type", "text/css");
css1ref.setAttribute("href", styles1);
document.getElementsByTagName("head")[0].appendChild(css1ref);

//var css2 = "css/resize.min.css";
var css2ref = document.createElement("link");
css2ref.setAttribute("rel", "stylesheet");
css2ref.setAttribute("type", "text/css");
css2ref.setAttribute("href", styles2);
document.getElementsByTagName("head")[0].appendChild(css2ref);

// load js hacks (TODO: make proper npm module for the sharkviewer)
var jssref = document.createElement("script");
jssref.setAttribute("src", "/external/SharkViewer/js/threejs/three.js");
document.getElementsByTagName("head")[0].appendChild(jssref);
jssref.onload = function() {
    var jssref2 = document.createElement("script");
    jssref2.setAttribute("src", "/external/SharkViewer/js/threejs/TrackballControls.js");
    document.getElementsByTagName("head")[0].appendChild(jssref2);
    var jssref3 = document.createElement("script");
    jssref3.setAttribute("src", "/external/SharkViewer/js/shark_viewer.js");
    document.getElementsByTagName("head")[0].appendChild(jssref3);
}

//var jssref4 = document.createElement("script");
//jssref4.setAttribute("src", "/external/neuroglancer/main.bundle.js");
//document.getElementsByTagName("head")[0].appendChild(jssref4);

// load form plugins
import loadPlugins from './helpers/initplugins';
loadPlugins(store);

// access global google datastore through the specified cloud function
var appDB = document.getElementById("analyzer").getAttribute("appdb");
store.dispatch({type: C.SET_APP_DB, appDB: appDB});

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
        document.getElementById("analyzer")
    );
}

// render interface with dom loaded
if (window.addEventListener) {
    window.addEventListener('DOMContentLoaded', loadInterface);
} else {
    $(document).ready(loadInterface);
}
