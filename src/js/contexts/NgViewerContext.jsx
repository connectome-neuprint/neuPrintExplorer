import React, { createContext, useState, useMemo } from 'react';
import PropTypes from 'prop-types';

export const NgViewerContext = createContext();

export function NgViewerProvider({ children }) {
  const [ngViewerState, setNgViewerState] = useState({
    navigation: {
      pose: {
        position: {
          voxelCoordinates: [],
        },
      },
      zoomFactor: 8,
    },
    layout: 'xy-3d',
    layers: [],
  });

  return (
    <NgViewerContext.Provider value={useMemo(() => ({ ngViewerState, setNgViewerState }), [ngViewerState, setNgViewerState])}>
      {children}
    </NgViewerContext.Provider>
  );
};

NgViewerProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
