import React from 'react';
import PropTypes from 'prop-types';

class GithubErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  render() {
    const { hasError } = this.state;
    const { children } = this.props;
    if (hasError) {
      // You can render any custom fallback UI
      return (
        <p>
          Unable to contact github API. Please see{' '}
          <a href="https://github.com/connectome-neuprint/neuPrintExplorer/issues">
            https://github.com/connectome-neuprint/neuPrintExplorer/issues
          </a>{' '}
          for issues.
        </p>
      );
    }

    return children;
  }
}

GithubErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired
};

export default GithubErrorBoundary;
