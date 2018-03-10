"use strict";

var AppReducers = require('./reducers');
var Redux = require('redux');
var ReactDOM = require('react-dom');

import {Provider} from 'react-redux';
import React from 'react';
import Master from "./components/Master.react";

// create redux store to handle app state
var store = Redux.createStore(AppReducers);

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

/*
 * Load interface into a DIV anchored by analyzer.
*/
function loadInterface() {
    ReactDOM.render(
        <Provider store={store}>
            <Master />
        </Provider>,
        document.getElementById("analyzer")
    );
}

// render interface with dom loaded
if (window.addEventListener) {
    window.addEventListener('DOMContentLoaded', loadInterface);
} else {
    $(document).ready(loadInterface);
}
