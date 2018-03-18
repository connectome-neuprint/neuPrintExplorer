"""Web server for connectome analyzer app.

The web application is mostly a static, client side app.
This server is responsible for the following:
    * setting configurations for this particular deploy
    * collecting basic statistics from connectome searches
    * managing authorization to various neo4j resources
    * managing authorization to user specific data
    * storing basic user configs such as favorites and default filters

User sessions are not tracked in this application.  Authentication
is done through Google authentication and tokens are used for
authorization.
"""

from flask import Flask
import json
import sys

app = Flask(__name__, static_folder='build')
neo4j_databases_config = None

"""Provides neo4j / dataset information for the website.

Proper authorization will unlock more options.
"""
@app.route('/neo4jconfig')
def configinfo():
    neo4jdatabases = json.load(open(neo4j_databases_config))
    return json.dumps(neo4jdatabases["public"])

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def static_page(path):
    if path.startswith("js/") or path.startswith("css/"):
        return app.send_static_file(path)
    return app.send_static_file('index.html')

if __name__ == '__main__':
    neo4j_databases_config = sys.argv[1]
    app.run(threaded=True)
