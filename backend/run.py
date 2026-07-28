from dotenv import load_dotenv
load_dotenv()

from flask import Flask
from flask_cors import CORS

from shared.error_handler import register_error_handlers
from core.socketio import socketio

from modules.deployments.routes import deployments_bp
from modules.auth.routes import auth_bp
from modules.users.routes import users_bp
from modules.inventory.routes import inventory_bp
from modules.monitoring.routes import monitoring_bp
from modules.incidents.routes import incidents_bp
from modules.dashboard.routes import dashboard_bp
from modules.ai.routes import ai_bp
from modules.notifications.routes import notifications_bp
from modules.remediation.routes import remediation_bp
from modules.discovery.routes import discovery_bp


app = Flask(__name__)


CORS(
    app,
    resources={r"/*": {"origins": "*"}}
)


socketio.init_app(
    app,
    cors_allowed_origins="*"
)


register_error_handlers(app)


app.register_blueprint(auth_bp)
app.register_blueprint(users_bp)
app.register_blueprint(inventory_bp)
app.register_blueprint(monitoring_bp)
app.register_blueprint(incidents_bp)
app.register_blueprint(dashboard_bp)
app.register_blueprint(ai_bp)
app.register_blueprint(deployments_bp)
app.register_blueprint(notifications_bp)
app.register_blueprint(remediation_bp)
app.register_blueprint(discovery_bp)


@app.route("/")
def home():
    return {
        "application": "CloudOps AI",
        "status": "running"
    }


if __name__ == "__main__":
    socketio.run(
        app,
        host="0.0.0.0",
        port=5000,
        debug=True
    )