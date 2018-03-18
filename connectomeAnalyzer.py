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

#app = Flask(__name__, static_url_path='/build')
app = Flask(__name__, static_folder='build')


@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def static_page(path):
    if path.startswith("js/") or path.startswith("css/"):
        return app.send_static_file(path)
    return app.send_static_file('index.html')

if __name__ == '__main__':
    app.run()
