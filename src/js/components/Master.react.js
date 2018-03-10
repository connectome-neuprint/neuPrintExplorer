/*
 * Top level page for displaying queries and results.
*/

"use strict";
import React from 'react';
import { HashRouter, Route, Match, hashHistory } from 'react-router-dom';
import Query from './Query.react';
import Results from './Results.react';

export default class Master extends React.Component {
    render() {
        return (
            <div>
                <HashRouter history={hashHistory}>
                    <div>
                        <Route
                            path="/"
                            component={Query}
                        />
                        <Route
                            path="/:queryType"
                            component={Query}
                        />
                    </div>
                </HashRouter>
                <Results />
            </div>
        );
    }
}

