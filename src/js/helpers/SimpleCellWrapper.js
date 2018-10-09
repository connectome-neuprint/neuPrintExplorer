/*
 * Wrapper to render simple cell and access table value.
*/

'use strict';

import SimpleCell from '../components/SimpleCell.react';
import React from 'react';
import { TableSortLabel } from 'material-ui/Table';
import Tooltip from 'material-ui/Tooltip';

export default class SimpleCellWrapper {
  constructor(key, child, isSimple = true, value = null, lockVal = -1, bgColor = '') {
    this.key = key;
    this.value = value;
    this.isSimple = isSimple;
    this.child = child;
    this.lockVal = lockVal;
    this.bgColor = bgColor;
  }

  getValue = () => {
    if (this.value !== null) {
      return this.value;
    } else {
      return this.child;
    }
  };

  getComponent = (sortFunc = null, orderBy = -1, enableSort = false, order = 'desc') => {
    if (sortFunc === null) {
      return (
        <SimpleCell
          key={this.key}
          value={this.value}
          isSimple={this.isSimple}
          lockVal={this.lockVal}
          bgColor={this.bgColor}
        >
          {this.child}
        </SimpleCell>
      );
    } else {
      return (
        <SimpleCell
          key={this.key}
          value={this.value}
          isSimple={this.isSimple}
          lockVal={this.lockVal}
          bgColor={this.bgColor}
        >
          <Tooltip title="Sort" placement={'bottom-end'} enterDelay={300}>
            <TableSortLabel active={enableSort} direction={order} onClick={() => sortFunc(orderBy)}>
              {this.child}
            </TableSortLabel>
          </Tooltip>
        </SimpleCell>
      );
    }
  };
}
