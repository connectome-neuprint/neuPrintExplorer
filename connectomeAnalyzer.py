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
from flask import abort
from flask import request as flaskrequest
import requests
import json
import sys
from tinydb import TinyDB, Query
from threading import Lock



app = Flask(__name__, static_folder='build')
neo4j_databases_config = None
MasterDatabase = None
GlobalLock = Lock()


@app.route('/favoritesdb', methods = ['GET'])
def get_favorite():
    # verify user
    token = flaskrequest.headers.get('authorization')
    res = requests.get("https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=" + str(token))
    if res.status_code != 200:
        abort(401)

    useremail = res.json()["email"]

    query = Query()
    favorites = []
    with GlobalLock: 
        favorites = MasterDatabase.search((query.user == useremail) & (query.favorite != ''))
    parsedfavorites = []
    for favorite in favorites:
        parsedfavorites.append(favorite["favorite"])
    return json.dumps(parsedfavorites)


@app.route('/favoritesdb', methods = ['POST'])
def add_favorite():
    # verify user
    token = flaskrequest.headers.get('authorization')
    res = requests.get("https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=" + str(token))
    if res.status_code != 200:
        abort(401)

    useremail = res.json()["email"]
    data = flaskrequest.get_json()

    with GlobalLock:
        MasterDatabase.insert({"user": useremail, "favorite": data})

    return ""

"""Provides neo4j / dataset information for the website.

Description:
    Proper authorization will unlock more options.
"""
@app.route('/neo4jconfig')
def configinfo():
    neo4jdatabases = json.load(open(neo4j_databases_config))
    return json.dumps(neo4jdatabases["public"])

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def static_page(path):
    if path.startswith("js/") or path.startswith("css/") or path.startswith("public/"):
        return app.send_static_file(path)
    return app.send_static_file('index.html')

if __name__ == '__main__':
    config = sys.argv[1]
    neo4j_databases_config = sys.argv[2]
    configdata = json.load(open(config))
    MasterDatabase = TinyDB(configdata["appInfoDB"])
    
    app.run(threaded=True)
