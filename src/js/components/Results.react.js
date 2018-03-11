/*
 * Main page to hold results from query.  This could be
 * a simple table or a table of tables.
*/

"use strict";

import React from 'react';
import Typography from 'material-ui/Typography';

// ?! connect to redux store
// ?! allow pagination and expact of individual tables
// ?! include table components
export default class Results extends React.Component {
    render() {
        //return <Typography noWrap>Hello World</Typography>;
        return <Typography noWrap>Hello World</Typography>;
    
        // ?! will show current query has been submitted with current status of query
        // ?! if query fails the message will be red, if succeed show runtime stats`
    
    }
}
