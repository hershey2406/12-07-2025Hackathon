from flask import Flask, request, jsonify
import os
import tempfile
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

# Initialize SQLAlchemy models if present. This makes the ORM-backed routes work.
try:
	from .models import db as models_db
	# Use DATABASE_URL if provided, otherwise default to a sqlite file next to this module.
	database_url = os.getenv("DATABASE_URL") or f"sqlite:///{os.path.join(os.path.dirname(__file__), 'today.db')}"
	app.config.setdefault("SQLALCHEMY_DATABASE_URI", database_url)
	app.config.setdefault("SQLALCHEMY_TRACK_MODIFICATIONS", False)
	models_db.init_app(app)
except Exception:
	# models or SQLAlchemy may not be installed in all environments; routes will error clearly.
	models_db = None



if __name__ == "__main__":
	port = int(os.getenv("PORT", 5000))
	debug = os.getenv("FLASK_DEBUG", "1") in ("1", "true", "True")
	app.run(host="0.0.0.0", port=port, debug=debug)