# neuPrintExplorer [![Picture](https://raw.github.com/janelia-flyem/janelia-flyem.github.com/master/images/HHMI_Janelia_Color_Alternate_180x40.png)](http://www.janelia.org)
[![Build Status](https://travis-ci.org/janelia-flyem/neuPrintExplorer.svg?branch=master)](https://travis-ci.org/janelia-flyem/neuPrintExplorer)

neuPrintExplorer is a single page web application that provides simple interfaces to query an EM connectome stored in [neuPrint](https://github.com/janelia-flyem/neuPrint), which uses the graph database Neo4j.  It contains
a number of plugins to facilitate different types of queries.
The application is written using REACT+Redux and Material-UI.

## Installation

To build the package for development:

    % npm install
    % npm run dev

To build for production:

    % npm install
    % npm run build

Currently, the skeletonization visualization is a third-party
library not built into the npm system.  For now,
add a copy of the library into the build or distribution
folder:

    % mkdir BUILD_DIR/external
    % cd BUILD_DIR/external
    % git clone https://github.com/JaneliaSciComp/SharkViewer.git

## Running

This app is dependent on [neuPrintHTTP](https://github.com/janelia-flyem/neuPrintHTTP), which is an http REST
API for connectomics that connects to neuPrint and also serves this static application.  To launch neuPrintHTTP and
the web application:

    % neuPrintHTTP -port 11000 config.json

config.json is a configuration file for accessing the backend and pointing to the 'build' created by this distribution.  For examples, please see neuPrintHTTP documentation.
