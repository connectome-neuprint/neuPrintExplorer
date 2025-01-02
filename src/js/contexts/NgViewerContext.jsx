import React, { createContext, useState, useMemo } from 'react';
import PropTypes from 'prop-types';

export const NgViewerContext = createContext();

export function NgViewerProvider({ children }) {
  const [ngViewerState, setNgViewerState] = useState({});

  return (
    <NgViewerContext.Provider value={useMemo(() => ({ ngViewerState, setNgViewerState }), [ngViewerState, setNgViewerState])}>
      {children}
    </NgViewerContext.Provider>
  );
};

NgViewerProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
