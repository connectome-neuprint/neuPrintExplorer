import React, { createContext, useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';

export const NgViewerContext = createContext();

export function NgViewerProvider({ children }) {
  const [ngViewerState, setNgViewerState] = useState({});
  const stableSetNgViewerState = useCallback(setNgViewerState, [setNgViewerState]);

  const contextValue = useMemo(() => ({
    ngViewerState,
    setNgViewerState: stableSetNgViewerState,
  }), [ngViewerState, stableSetNgViewerState]);

  return (
    <NgViewerContext.Provider value={contextValue}>
      {children}
    </NgViewerContext.Provider>
  );
};

NgViewerProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
