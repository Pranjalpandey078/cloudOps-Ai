from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()


def create_app():
    app = Flask(__name__)

    from app.config.settings import Config
    app.config.from_object(Config)

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)

    @app.route("/")
    def home():
        return {
            "application": "CloudOps AI Platform",
            "status": "Running"
        }

    @app.route("/health")
    def health():
        return {
            "status": "healthy"
        }

    return app
