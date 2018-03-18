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
import SimpleTables from './SimpleTables.react';

class Results extends React.Component {
    render() {
        //return <Typography noWrap>Hello World</Typography>;
        // TODO: show query runtime results
        return (
            <div>
                <Typography variant="title">Query Results</Typography>
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
                    (<Typography>Error: {this.props.neoError.code}</Typography>) :
                    (this.props.allTables !== null ?
                        (
                            <div>
                                <Typography>Query succeeded</Typography>
                                <SimpleTables allTables={this.props.allTables} />
                            </div>
                        ) : 
                        (<div />)
                    )
                }
            </div>
        );
    }
}

// result data [{name: "table name", header: [headers...], body: [rows...]
var ResultsState  = function(state){
    return {
        isQuerying: state.isQuerying,
        neoError: state.neoError,
        allTables: state.allTables
    }   
};

export default connect(ResultsState, null)(Results);
