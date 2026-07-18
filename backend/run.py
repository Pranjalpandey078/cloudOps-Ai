from flask import Flask
from flask_cors import CORS

from modules.auth.routes import auth_bp
from modules.users.routes import users_bp
from modules.inventory.routes import inventory_bp
from modules.monitoring.routes import monitoring_bp

from shared.error_handler import register_error_handlers


# Create Flask application
app = Flask(__name__)

# Enable CORS
CORS(app)

# Register global error handlers
register_error_handlers(app)

# Register Blueprints
app.register_blueprint(auth_bp)
app.register_blueprint(users_bp)
app.register_blueprint(inventory_bp)
app.register_blueprint(monitoring_bp)


@app.route("/")
def home():
    return {
        "application": "CloudOps AI",
        "status": "running"
    }


if __name__ == "__main__":
    app.run(debug=True)