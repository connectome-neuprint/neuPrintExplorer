/*
 * Handle neo4j server information.
*/

"use strict";

import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import _ from "underscore";
import C from "../reducers/constants"

class MetaInfo extends React.Component {
    constructor(props) {
        super(props);
        this.updateDB(this.props.userInfo);
    }
   
    componentWillReceiveProps(nextProps) {
        if (nextProps.userInfo === null && this.props.userInfo !== null) {
            this.props.setNeoDatasets([], {}, {});
            this.props.setNeoServer("");
        }
        
        if (!_.isEqual(nextProps.userInfo, this.props.userInfo)) {
            this.updateDB(nextProps.userInfo);        
        }
    }

    updateDB = () => {
        fetch('/api/dbmeta/datasets', {
            credentials: 'include'
        })
            .then(result=>result.json())
            .then(items=> {
                if (!("message" in items)) {
                    let datasets = [];
                    let rois = {}
                    let datasetInfo = {}
                    for (let dataset in items) {
                        datasets.push(dataset)
                        rois[dataset] = items[dataset].ROIs.sort();
                        datasetInfo[dataset] = {
                            uuid:   items[dataset].uuid,
                            lastmod: items[dataset]["last-mod"]
                        }
                    }
                    this.props.setNeoDatasets(datasets, rois, datasetInfo);
                }
            });
        fetch('/api/dbmeta/database', {
            credentials: 'include'
        })            
            .then(result=>result.json())
            .then(data=> {
                if (!("message" in data)) {
                    this.props.setNeoServer(data.Location);
                }
            });
    }
    
    render () {
        return (
            <div />
        );
    }
}

MetaInfo.propTypes = {
    setNeoDatasets: PropTypes.func.isRequired,
    setNeoServer: PropTypes.func.isRequired,
    userInfo: PropTypes.object,
};


var MetaInfoState = function(state) {
    return {
        userInfo: state.user.userInfo
    }
}

var MetaInfoDispatch = function(dispatch) {
    return {
        setNeoDatasets: function(datasets, rois, datasetInfo) {
            dispatch({
                type: C.SET_NEO_DATASETS,
                availableDatasets: datasets,
                availableROIs: rois,
                datasetInfo: datasetInfo,
            });
        },
        setNeoServer: function(server) {
            dispatch({
                type: C.SET_NEO_SERVER,
                neoServer: server,
            });
        }
    }
}

export default connect(MetaInfoState, MetaInfoDispatch)(MetaInfo);

