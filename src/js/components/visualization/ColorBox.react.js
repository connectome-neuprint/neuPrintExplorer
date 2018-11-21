import React from 'react';

export default ({ margin, width, height, backgroundColor, title, text }) => {
  const styles = {
    margin: margin + 'px',
    width: width + 'px',
    minWidth: width + 'px',
    height: height + 'px',
    minHeight: height + 'px',
    backgroundColor: backgroundColor,
    overflow: 'visible',
    display: 'inline-flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row'
  };
  return (
    <div style={styles} title={title}>
      {text}
    </div>
  );
};
