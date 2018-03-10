"use strict";

var AppReducers = require('./reducers');
var Redux = require('redux');
var ReactDOM = require('react-dom');

import {Provider} from 'react-redux';
import React from 'react';
import Master from "./components/Master.react";
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

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



/*
 * Load interface into a DIV anchored by analyzer.
*/
function loadInterface() {
    ReactDOM.render(
        <MuiThemeProvider>
            <Provider store={store}>
                <Master />
            </Provider>
        </MuiThemeProvider>,
        document.getElementById("analyzer")
    );
}

// render interface with dom loaded
if (window.addEventListener) {
    window.addEventListener('DOMContentLoaded', loadInterface);
} else {
    $(document).ready(loadInterface);
}
