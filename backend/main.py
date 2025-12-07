from flask import Flask, request, jsonify
import os
import tempfile
from dotenv import load_dotenv
from models import db

load_dotenv()

app = Flask(__name__)

db.init_app(app)
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

if __name__ == "__main__":
	port = int(os.getenv("PORT", 5000))
	debug = os.getenv("FLASK_DEBUG", "1") in ("1", "true", "True")
	app.run(host="0.0.0.0", port=port, debug=debug)