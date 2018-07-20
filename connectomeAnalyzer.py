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
from neo4j.v1 import GraphDatabase, basic_auth

app = Flask(__name__, static_folder='dist')
neo4j_databases_config = None
MasterDatabase = None
GlobalLock = Lock()

# provides session for a given server
NeoSessions = {}
NeoDrivers = {}

# maps user token to a server
TokenServers = {}

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


"""Retrieves data from cypher query for authenticated users.
"""
@app.route('/query', methods = ['POST'])
def query():
    token = flaskrequest.headers.get('authorization')
    if token not in TokenServers:
        abort(401)
    neoServer = TokenServers[token]
    db = NeoSessions[neoServer]
    try:
        data = flaskrequest.data
        res = db.run(str(data))
        return json.dumps(res.data())
    except Exception as e:
        abort(400)

"""Provides information for the default server.
"""
@app.route('/serverinfo')
def serverinfo():
    token = flaskrequest.headers.get('authorization')
    if token not in TokenServers:
        abort(401)
    neoServer = TokenServers[token]

    neo4jdatabases = json.load(open(neo4j_databases_config))
    targetDB = None
    
    if "public" in neo4jdatabases:
        for db in neo4jdatabases["public"]:
            if db["server"] == neoServer:
                targetDB = db
                break
    if "private" in neo4jdatabases:
        for db in neo4jdatabases["private"]:
            if db["server"] == neoServer:
                targetDB = db
                break
    
    if targetDB is None:
        abort(403)

    resp = {
            "rois": targetDB["rois"],
            "datasets": targetDB["datasets"]
    }
    return json.dumps(resp)


"""Provides neo4j / dataset information for the website.

Description:
    Proper authorization will unlock more options.
"""
@app.route('/neo4jconfig')
def configinfo():
    useremail = ""
    try:
        token = flaskrequest.headers.get('authorization')
        res = requests.get("https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=" + str(token))
        if res.status_code != 200:
            abort(401)
        useremail = res.json()["email"]
    except:
        pass
            
    databases = []
    neo4jdatabases = json.load(open(neo4j_databases_config))
    if "public" in neo4jdatabases:
        for db in neo4jdatabases["public"]:
            if "authorized-users" in db:
                del db["authorized-users"]
        databases.extend(neo4jdatabases["public"])
    if "private" in neo4jdatabases:
        for db in neo4jdatabases["private"]:
            for authuser in db["authorized-users"]:
                if authuser[0] == useremail:
                    del db["authorized-users"]
                    databases.append(db)

    return json.dumps(databases)

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def static_page(path):
    if path.startswith("js/") or path.startswith("css/") or path.startswith("public/") or path.startswith("external/"):
        return app.send_static_file(path)
    return app.send_static_file('index.html')

def add_session(server, user, password):
    driver = GraphDatabase.driver('bolt://' + server,auth=basic_auth(user, password))
    NeoDrivers[server] = driver
    NeoSessions[server] = driver.session()

if __name__ == '__main__':
    config = sys.argv[1]
    neo4j_databases_config = sys.argv[2]
    configdata = json.load(open(config))
    MasterDatabase = TinyDB(configdata["appInfoDB"])
    
    neo4jdatabases = json.load(open(neo4j_databases_config))
    if "public" in neo4jdatabases:
        for db in neo4jdatabases["public"]:
            add_session(db["server"], db["user"], db["password"])
            if "authorized-users" in db:
                for authuser in db["authorized-users"]:
                    TokenServers[authuser[1]] = db["server"]
            else:
                TokenServers[""] = db["server"]

    if "private" in neo4jdatabases:
        for db in neo4jdatabases["private"]:
            add_session(db["server"], db["user"], db["password"])
            if "authorized-users" in db:
                for authuser in db["authorized-users"]:
                    TokenServers[authuser[1]] = db["server"]

    app.run(threaded=True)
