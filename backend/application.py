"""Flask application factory and module-level `app` used by helpers.

This file builds the Flask app and initializes `models.db`. It is used by
`create_tables.py` which imports `app` and runs `db.create_all()` under the
app context.
"""
import os
import os.path
from flask import Flask
from flask_cors import CORS
import models


def create_app():
	app = Flask(__name__)
	database_url = os.getenv("DATABASE_URL")
	if not database_url:
		db_path = os.getenv("DB_PATH") or os.path.join(os.path.dirname(__file__), "today.db")
		if "://" in db_path:
			database_url = db_path
		else:
			database_url = f"sqlite:///{db_path}"
	app.config["SQLALCHEMY_DATABASE_URI"] = database_url
	app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
	models.db.init_app(app)
	
	# Enable CORS for frontend communication
	allowed_origins = os.getenv("ALLOWED_ORIGINS", "*").split(",")
	CORS(app, resources={r"/api/*": {"origins": allowed_origins}}, supports_credentials=True)
	
	return app


app = create_app()


if __name__ == "__main__":
	# Simple local runner for convenience (not intended for production)
	app.run(host="0.0.0.0", port=int(os.getenv("PORT", "5000")), debug=True)
