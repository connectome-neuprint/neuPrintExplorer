/*
 * Handle neo4j server information.
*/

"use strict";

import React from 'React';
import { connect } from 'react-redux';
import TextField from 'material-ui/TextField';
import Button from 'material-ui/Button';
import Icon from 'material-ui/Icon';
import Badge from 'material-ui/Badge';
import PropTypes from 'prop-types';
import _ from "underscore";
import C from "../reducers/constants"

class MetaInfo extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            neoServer: "",
            datasets: [],
            rois: {},
            datsasetInfo: {},
        };

        this.updateDB(this.props.userInfo);
    }
   
    componentWillReceiveProps(nextProps) {
        if (!_.isEqual(nextProps.userInfo, this.props.userInfo)) {
            this.updateDB(nextProps.userInfo);        
        }
    }

    updateDB = (userInfo) => {
        fetch('/api/dbmeta/datasets')
            .then(result=>result.json())
            .then(items=> {
                let datasets = [];
                let rois = {}
                let datasetInfo = {}
                for (let dataset in items) {
                    datasets.push(dataset)
                    rois[dataset] = items[dataset].ROIs;
                    datasetInfo[dataset] = {
                        uuid:   items[dataset].uuid,
                        lastmod: items[dataset]["last-mod"]
                    }
                }
                
                this.setState({
                        datasets: datasets,
                        rois: rois,
                        datasetInfo: datasetInfo,
                    }
                );
                
                this.props.setNeoDatasets(datasets, rois, datasetInfo);
            });
        fetch('/api/dbmeta/database')
            .then(result=>result.json())
            .then(data=> {
                this.props.setNeoServer(data.Location);
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

