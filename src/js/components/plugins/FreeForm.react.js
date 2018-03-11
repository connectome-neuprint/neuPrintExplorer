/*
 * Supports simple, custom neo4j query.
*/

"use strict"

import React from 'react';

export default class FreeForm extends React.Component {
    static get name() {
      return "Custom";
    }
    render() {
        return <div /> ;
    }
}

Object.defineProperty(FreeForm, 'name2', {
    value: "Custom",
    writable : false,
    enumerable : true,
    configurable : false
});
