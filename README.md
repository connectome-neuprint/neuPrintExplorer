# neuPrintExplorer [![Picture](https://raw.github.com/janelia-flyem/janelia-flyem.github.com/master/images/HHMI_Janelia_Color_Alternate_180x40.png)](http://www.janelia.org)
[![Build Status](https://travis-ci.org/janelia-flyem/neuPrintExplorer.svg?branch=master)](https://travis-ci.org/janelia-flyem/neuPrintExplorer)

neuPrintExplorer is a single page web application that provides simple interfaces to query an EM connectome stored in [neuPrint](https://github.com/janelia-flyem/neuPrint), which uses the graph database Neo4j.  It contains
a number of plugins to facilitate different types of queries.  It is bundled with
a light-weight Flask server that handles authorization for storing some user information, such as a list of favorite queries.
The application is written using REACT+Redux and Material-UI.

## Installation

There is a pre-build distribution in the 'dist' directory that can be served by the included Python Flask server.  To build
the package for development:

    % npm install
    % grunt #(or grunt dist to build the distribution)

The python server has the following dependencies:

* Flask
* tinydb

Currently, the skeletonization visualization is a third-party
library not built into the npm system.  For now,
add a copy of the library into the build or distribution
folder:

    % mkdir BUILD_DIR/external
    % cd BUILD_DIR/external
    % git clone https://github.com/JaneliaSciComp/SharkViewer.git

## Running

To launch a server (port 5000 by default):

    % python connectomeAnalyzer.py config.json neo4jconfig.json

config.json points to a json file that stores user data and other application information logs (TBD).  neo4jconfig.json provides
a path to the neo4jconfiguration.  At this point, the password information for the Neo4j server is embedded in this file.
Within the application, there is currently authentication supported using Google oauth and authorization in the python server.
This is only being
used for authorizing access to query favorites.  These features will be extended to better support authorization for different Neo4j
databases.
