# neuPrintExplorer [![Picture](https://raw.github.com/janelia-flyem/janelia-flyem.github.com/master/images/HHMI_Janelia_Color_Alternate_180x40.png)](http://www.janelia.org)
[![Build Status](https://travis-ci.org/connectome-neuprint/neuPrintExplorer.svg?branch=master)](https://travis-ci.org/connectome-neuprint/neuPrintExplorer)
[![GitHub issues](https://img.shields.io/github/issues/connectome-neuprint/neuPrintExplorer.svg)](https://GitHub.com/connectome-neuprint/neuPrintExplorer/issues/)

### "exploring inter and intra cellular interactions"

neuPrintExplorer is a single page web application that provides simple interfaces to query
an EM connectome stored in [neuPrint](https://github.com/connectome-neuprint/neuPrint),
which uses the graph database Neo4j.  It contains a number of plugins to facilitate different
types of queries. The application is written using REACT + Redux and Material-UI.

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
and link them into your development copy of neuPrintExplorer. Please see the [README](https://github.com/connectome-neuprint/neuPrintExplorerPlugins/blob/master/README.md) in the neuPrintExplorerPlugins repository for more information on writing your own plugins.


## Running

This app is dependent on [neuPrintHTTP](https://github.com/connectome-neuprint/neuPrintHTTP), which is an http REST
API for connectomics that connects to neuPrint and also serves this static application.  To launch neuPrintHTTP and
the web application:

    % neuPrintHTTP -port 11000 config.json

config.json is a configuration file for accessing the backend and pointing to the 'build' created by this distribution.  For examples, please see neuPrintHTTP documentation.

## Authentication

From v1.68.0 onward, neuPrintExplorer's login and dataset-access flow expects a
[neuPrintHTTP](https://github.com/connectome-neuprint/neuPrintHTTP) server (v1.8.0 or later)
backed by a [DatasetGateway](https://github.com/JaneliaSciComp/DatasetGateway) (DSG),
which manages user grants, terms-of-service acceptance, and public/anonymous access.

Deployments that use the legacy Google-auth / `authorized.json` model should build the
pre-DSG pairing instead: neuPrintExplorer **v1.67.3** (which includes the Neuroglancer 3
viewer; use v1.67.2 for the older viewer) with neuPrintHTTP **v1.7.10**.
