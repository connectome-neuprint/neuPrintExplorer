/*
 * Query to find autapses in the volume.
*/

""

import React from 'react';
import Button from '@material-ui/core/Button';
import PropTypes from 'prop-types';
import queryAutapses from '../../neo4jqueries/autapses';

export default class Autapses extends React.Component {
    static get queryName() {
        return "Autapses";
    }
    
    static get queryDescription() {
        return "Finds all the self connections (loops) in the dataset.";
    }
 
    render() {
        return (
                    <Button
                        variant="contained"
                        onClick={() => {
                            this.props.callback(queryAutapses(this.props.datasetstr));
                        }}
                    >
                        Submit
                    </Button>
        );
    }
}

Autapses.propTypes = {
    callback: PropTypes.func.isRequired,
    datasetstr: PropTypes.string.isRequired,
};

