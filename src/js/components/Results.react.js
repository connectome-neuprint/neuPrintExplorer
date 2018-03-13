/*
 * Main page to hold results from query.  This could be
 * a simple table or a table of tables.
*/

"use strict";

import React from 'react';
import Typography from 'material-ui/Typography';
import Fade from 'material-ui/transitions/Fade';
import { CircularProgress } from 'material-ui/Progress';
import { connect } from 'react-redux';


// ?! connect to redux store
// ?! allow pagination and expact of individual tables
// ?! include table components
class Results extends React.Component {
    render() {
        //return <Typography noWrap>Hello World</Typography>;
        if (this.props.neoError !== null) {
            alert(this.props.neoError);
        }

        return (
            <div>
                <Fade
                    in={this.props.isQuerying}
                    style={{
                        transitionDelay: this.props.isQuerying ? '800ms' : '0ms',
                    }}
                    unmountOnExit
                >
                    <CircularProgress />
                </Fade>
                { (this.props.neoError !== null) ? 
                    <div>{String(this.props.neoError)}</div> : <div />
                }
            </div>
        );
            
            <Typography noWrap>Hello World</Typography>;
    
        // ?! will show current query has been submitted with current status of query
        // ?! if query fails the message will be red, if succeed show runtime stats`
    
    }
}

var ResultsState  = function(state){
    return {
        isQuerying: state.isQuerying,
        neoError: state.neoError
    }   
};

export default connect(ResultsState, null)(Results);
