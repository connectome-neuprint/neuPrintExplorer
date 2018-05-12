/*
 * Wrapper to render simple cell and access table value.
*/

"use strict";

import SimpleCell from '../components/SimpleCell.react';
import React from 'react';

export default class SimpleCellWrapper {
    constructor(key, child, isSimple=true, value=null, lockVal=-1) {
        this.key = key;
        this.value = value;
        this.isSimple = isSimple;
        this.child = child;
        this.lockVal=lockVal;
    }

    getValue = () => {
        if (this.value !== null) {
            return this.value;
        } else {
            return this.child;
        }
    }

    getComponent = () => {
        return (<SimpleCell
                            key={this.key}
                            value={this.value}
                            isSimple={this.isSimple}
                            lockVal={this.lockVal}
                >
                    {this.child}
                </SimpleCell>);
    }
}


