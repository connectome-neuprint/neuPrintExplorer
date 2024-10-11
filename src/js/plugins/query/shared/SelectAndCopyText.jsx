import React from 'react';
import PropTypes from 'prop-types';

export default class SelectAndCopyText extends React.Component {
  constructor(props) {
    super(props);
    this.selectRef = React.createRef();
    this.state = { hover: false };
  }

  handleClick = () => {
    const { actions } = this.props;
    const range = document.createRange();
    const textNode = this.selectRef.current;
    range.selectNodeContents(textNode);
    // removes all ranges from selection
    window.getSelection().removeAllRanges();
    // adds text in node to selection
    window.getSelection().addRange(range);
    document.execCommand('copy');
    window.getSelection().removeAllRanges();
    actions.launchNotification('Copied to clipboard');
  };

  toggleHover = () => {
    const { hover } = this.state;
    this.setState({ hover: !hover });
  };

  render() {
    const { text } = this.props;
    const { hover } = this.state;
    return (
      <span
        ref={this.selectRef}
        onClick={this.handleClick}
        onKeyDown={this.handleClick}
        onMouseOver={this.toggleHover}
        onMouseOut={this.toggleHover}
        onFocus={() => {}}
        onBlur={() => {}}
        tabIndex={-1}
        role="link"
        style={
          hover
            ? { backgroundColor: '#4085f7', color: 'white', outline: 'none' }
            : { backgroundColor: 'transparent', outline: 'none' }
        }
      >
        {text}
      </span>
    );
  }
}

SelectAndCopyText.propTypes = {
  text: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  actions: PropTypes.object.isRequired
};
