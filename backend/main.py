from flask import Flask, request, jsonify
import os
import tempfile
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)



if __name__ == "__main__":
	port = int(os.getenv("PORT", 5000))
	debug = os.getenv("FLASK_DEBUG", "1") in ("1", "true", "True")
	app.run(host="0.0.0.0", port=port, debug=debug)