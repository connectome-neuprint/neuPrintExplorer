/*
 * Supports simple, custom neo4j query.
*/

"use strict"

import React from 'react';

export default class FreeForm extends React.Component {
    render() {
        return <div /> ;
    }
}

Object.defineProperty(FreeForm, 'name', {
    value: "Custom",
    writable : false,
    enumerable : true,
    configurable : false
});
