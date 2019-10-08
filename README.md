# neuPrintExplorer [![Picture](https://raw.github.com/janelia-flyem/janelia-flyem.github.com/master/images/HHMI_Janelia_Color_Alternate_180x40.png)](http://www.janelia.org)
[![Build Status](https://travis-ci.org/connectome-neuprint/neuPrintExplorer.svg?branch=master)](https://travis-ci.org/connectome-neuprint/neuPrintExplorer)
[![GitHub issues](https://img.shields.io/github/issues/connectome-neuprint/neuPrintExplorer.svg)](https://GitHub.com/connectome-neuprint/neuPrintExplorer/issues/)

neuPrintExplorer is a single page web application that provides simple interfaces to query an EM connectome stored in [neuPrint](https://github.com/connectome-neuprint/neuPrint), which uses the graph database Neo4j.  It contains
a number of plugins to facilitate different types of queries.
The application is written using REACT+Redux and Material-UI.

## Installation

    % git clone git@github.com:connectome-neuprint/neuPrintExplorer.git
    % cd neuPrintExplorer

To build the package for development:
    
    % npm install
    % npm run dev

To build for production:

    % npm install
    % npm run build

    
Finally, you will need plugins to perform the queries and display
the results. Core plugins can be found in their own repository at:
[neuPrintExplorerPlugins](https://github.com/connectome-neuprint/neuPrintExplorerPlugins). 
These are marked as a dependency for neuPrintExplorer, so they will get installed
at the same time. If you wish to make changes to the plugins and test them
localy, without publishing them to npm, you will need to clone the repository
and link them into your development copy of neuPrintExplorer:

    % git clone git@github.com:connectome-neuprint/neuPrintExplorerPlugins.git
    % cd neuPrintExplorerPlugins
    % lerna bootstrap
    % lerna exec npm link
    % lerna link
    % lerna exec --parallel -- npm run dev

In a new terminal:

    % cd neuPrintExplorer
    % npm link @neuprint/queries @neuprint/views @neuprint/support
       
If you wish to write your own custom plugins, they need to be placed in the following locations

view-plugins should be linked into:
       
    src/js/components/view-plugins
      
query plugins should be linked into:

    src/js/components/plugins

See the [README](https://github.com/connectome-neuprint/neuPrintExplorerPlugins/blob/master/README.md) in the neuPrintExplorerPlugins repository for more information
writing your own plugins.

## Running

This app is dependent on [neuPrintHTTP](https://github.com/connectome-neuprint/neuPrintHTTP), which is an http REST
API for connectomics that connects to neuPrint and also serves this static application.  To launch neuPrintHTTP and
the web application:

    % neuPrintHTTP -port 11000 config.json

config.json is a configuration file for accessing the backend and pointing to the 'build' created by this distribution.  For examples, please see neuPrintHTTP documentation.
