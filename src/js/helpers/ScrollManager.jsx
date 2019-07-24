/*
 * The MIT License
 *
 * Copyright (c) Jeff Hansen 2018 to present.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 * */

import React from 'react';
import PropTypes from 'prop-types';
import requestAnimationFrame from 'raf';

export const memoryStore = {
  data: new Map(),
  get(key) {
    if (!key) {
      return null;
    }

    return this.data.get(key) || null;
  },
  set(key, data) {
    if (!key) {
      return null;
    }
    return this.data.set(key, data);
  }
};

function scroll(target, x, y) {
  const updateTarget = target;
  if (updateTarget instanceof window.Window) {
    updateTarget.scrollTo(x, y);
  } else {
    updateTarget.scrollLeft = x;
    updateTarget.scrollTop = y;
  }
}

function getScrollPosition(target) {
  if (target instanceof window.Window) {
    return { x: target.scrollX, y: target.scrollY };
  }

  return { x: target.scrollLeft, y: target.scrollTop };
}

/**
 *  * Component that will save and restore Window scroll position.
 *   */
export default class ScrollPositionManager extends React.Component {
  constructor(props) {
    super(props);
    this.connectScrollTarget = this.connectScrollTarget.bind(this);
    this.target = window;
  }

  componentDidMount() {
    this.restoreScrollPosition();
  }

  componentWillReceiveProps(nextProps) {
    const { scrollKey } = this.props;
    if (scrollKey !== nextProps.scrollKey) {
      this.saveScrollPosition();
    }
  }

  componentDidUpdate(prevProps) {
    const { scrollKey } = this.props;
    if (scrollKey !== prevProps.scrollKey) {
      this.restoreScrollPosition();
    }
  }

  componentWillUnmount() {
    this.saveScrollPosition();
  }

  restoreScrollPosition(pos) {
    const { scrollStore, scrollKey } = this.props;
    const updatePos = pos || scrollStore.get(scrollKey);
    if (this.target && updatePos) {
      requestAnimationFrame(() => {
        scroll(this.target, updatePos.x, updatePos.y);
      });
    }
  }

  saveScrollPosition(key) {
    const { scrollStore, scrollKey } = this.props;
    if (this.target) {
      const pos = getScrollPosition(this.target);
      const updateKey = key || scrollKey;
      scrollStore.set(updateKey, pos);
    }
  }

  connectScrollTarget(node) {
    this.target = node;
  }

  render() {
    const { children = null, ...props } = this.props;
    return children && children({ ...props, connectScrollTarget: this.connectScrollTarget });
  }
}

ScrollPositionManager.propTypes = {
  scrollKey: PropTypes.string.isRequired,
  scrollStore: PropTypes.object,
  children: PropTypes.func.isRequired
};

ScrollPositionManager.defaultProps = {
  scrollStore: memoryStore
};
