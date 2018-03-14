"use strict";

//var AppReducers = require('./reducers');

import AppReducers from './reducers';
var Redux = require('redux');
var ReactDOM = require('react-dom');

import {Provider} from 'react-redux';
import React from 'react';
import Master from "./components/Master.react";

import CssBaseline from 'material-ui/CssBaseline';

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

// load form plugins
import loadPlugins from './initplugins';
loadPlugins(store);

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
