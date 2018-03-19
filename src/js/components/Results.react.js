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
import Icon from 'material-ui/Icon';
import IconButton from 'material-ui/IconButton';

class Results extends React.Component {
    addFavorite = () => {
        var googleToken = "";
        if (this.props.userInfo !== null) {
            googleToken = this.props.userInfo["Zi"]["id_token"];
        }
        var loc = window.location.pathname + window.location.search;
        return fetch("/favorites", {
            body: JSON.stringify({"name": "bookmarkname", "url": loc}),
            headers: {
                'Authorization': googleToken,
                'content-type': 'application/json'
            },
            method: 'POST',
        })
        .then((resp) => {
            if (resp.status === 401) {
                // need to re-authenticate
                this.props.reAuth();
                alert("User must re-authenticate");
            }
        });
    }

    render() {
        //return <Typography noWrap>Hello World</Typography>;
        // TODO: show query runtime results
        return (
            <div>
                <Typography variant="title">Query Results</Typography>
                { (this.props.userInfo !== null && this.props.allTables !== null) ? (
                    <IconButton color="secondary"
                                aria-label="Bookmark"
                                onClick={this.addFavorite}
                    >
                        <Icon>star</Icon>
                    </IconButton>
                  ) : (
                    <div />
                  )
                }
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
var ResultsState = function(state){
    return {
        isQuerying: state.isQuerying,
        neoError: state.neoError,
        allTables: state.allTables,
        userInfo: state.userInfo
    }   
};

var ResultsDispatch = function(dispatch) {
   return {
        reAuth: function() {
            dispatch({
                type: 'LOGOUT_USER'
            });
        }
   }
}

export default connect(ResultsState, ResultsDispatch)(Results);
