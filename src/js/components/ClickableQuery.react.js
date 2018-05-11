/*
 * Create a div link that calls neo4j query.
*/

"use strict";
import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import { withStyles } from 'material-ui/styles';

const styles = () => ({
  root: {
      minHeight: "100%",
      '&:hover': {
          backgroundColor: "rgba(0, 0, 0, 0.12)"
      }
  },
});



class ClickableQuery extends React.Component {
    render() {
        const { classes } = this.props;
        return (
            <div 
                    className={classes.root}
                    onClick={() => this.props.updateQuery(this.props.neoQueryObj)}>
                {this.props.children}
            </div>
        );
    }
}

ClickableQuery.defaultProps = {
    children: <div />
};

ClickableQuery.propTypes = {
    children: PropTypes.any.isRequired,
    classes: PropTypes.object.isRequired,
    updateQuery: PropTypes.func.isRequired, 
    neoQueryObj: PropTypes.shape({
        queryStr: PropTypes.string.isRequired,
        callback: PropTypes.func.isRequired,
        state: PropTypes.object.isRequred,
    }),
}

var ClickableQueryDispatch = function(dispatch) {
    return {
        updateQuery: function(query) {
            dispatch({
                type: 'UPDATE_QUERY',
                neoQueryObj: query
            });
        }
    }
}

export default withStyles(styles)(connect(null, ClickableQueryDispatch)(ClickableQuery));

