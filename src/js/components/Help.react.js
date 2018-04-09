/*
 * Help page provides documentation.
*/

"use strict";
import React from 'react';
import Typography from 'material-ui/Typography';
import _ from "underscore";
import PropTypes from 'prop-types';
import {withStyles} from 'material-ui/styles';
import {
  Deck, Slide, Image 
} from 'spectacle';

const styles = () => ({
    root: {
        overflow: "scroll",
        position: "relative",
        width: "100%",
        height: "100%",
    },
    roottext: {
        flex: 1
    },
    secroot: {
        position: "relative",
        width: "100%",
        height: "100%",
    },
});

const MaxSlideNum = 19;

class Help extends React.Component {
    constructor(props) {
        super(props);
    }
    
    // if only query string has updated, prevent re-render
    shouldComponentUpdate(nextProps, nextState) {
        nextProps.location["search"] = this.props.location["search"];
        return (!_.isEqual(nextProps, this.props) || !_.isEqual(nextState, this.state));
    }
   
    render() {
        const {classes} = this.props;
        
        return (
            <div className={classes.root}>
                <div className={classes.roottext}>
                    <Typography variant="title">
                        Graph Model Documentation
                    </Typography>
                    <br />
                    <Typography variant="body1">
                        The following slides describe how data is stored in Neo4j.
                    </Typography>
                </div>
                <div className={classes.secroot}>
                    <Deck
                            controls
                    >
                    {
                        _.range(1, MaxSlideNum+1).map( val => {
                            return (<Slide 
                                            bgColor={"#D0D0D0"}
                                            key={val}
                                    >
                                            <Image 
                                                    src={"/public/graphmodel/Slide" + String(val) + ".jpeg"}
                                            />
                                    </Slide>)
                        })
                    }
                    </Deck>
                </div>
            </div>
        );
    }
}

Help.propTypes = {
    location: PropTypes.shape({
        search: PropTypes.string.isRequired
    }),
    classes: PropTypes.object,
}

export default withStyles(styles)(Help);
