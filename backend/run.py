from flask import Flask
from flask_cors import CORS

from modules.auth.routes import auth_bp
from modules.users.routes import users_bp

app = Flask(__name__)

CORS(app)

# Register Blueprints
app.register_blueprint(auth_bp)
app.register_blueprint(users_bp)


@app.route("/")
def home():
    return {
        "application": "CloudOps AI",
        "status": "running"
    }


if __name__ == "__main__":
    app.run(debug=True)