from flask import Flask, request, jsonify
import os
import tempfile
from dotenv import load_dotenv
from .helpers import _openai_available, _summarize_with_openai, _naive_summarize, _ocr_image, _fetch_and_extract

load_dotenv()
app = Flask(__name__)


@app.route("/health", methods=["GET"])
def health():
	"""Health check endpoint.

	Returns a simple JSON object indicating the service is up. Useful for
	load balancer / deployment health probes.
	"""
	return jsonify({"status": "ok"})


@app.route("/news", methods=["POST"])
def news():
	"""Summarize posted news text or accept audio uploads.

	Behavior:
	- If the request contains JSON with a `text` field, create and return a
	  short summary (prefers OpenAI when configured).
	- If the request is a multipart upload with an `audio` file, the file is
	  saved to a temporary path and a 501 response is returned until server-
	  side speech-to-text is implemented.

	Accepts form-encoded `text` as well for browser form submission.
	"""
	# Handle multipart audio upload
	if request.content_type and request.content_type.startswith("multipart/") and "audio" in request.files:
		# Save uploaded audio to a temp file (frontend can send the recorded audio here).
		audio = request.files["audio"]
		suffix = os.path.splitext(audio.filename)[1] or ".wav"
		with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
			audio.save(tmp.name)
			tmp_path = tmp.name
		# At the moment we do not run speech-to-text on the server by default.
		# Implement STT (Whisper or cloud STT) and then call same summarizer flow.
		return jsonify({
			"status": "not_implemented",
			"message": "Audio upload saved but speech-to-text is not configured on the server. Configure STT (Whisper/openai or cloud STT) to transcribe the audio, or send text directly.",
			"temp_path": tmp_path,
		}), 501

	# Try JSON body
	data = None
	if request.is_json:
		data = request.get_json()

	text = None
	if data and isinstance(data, dict):
		text = data.get("text")

	# Also accept form-encoded text
	if not text:
		text = request.form.get("text") or request.values.get("text")

	if not text:
		return jsonify({"error": "No text provided. Send JSON {\"text\": ...} or a form field 'text'."}), 400

	# Prefer OpenAI if available, otherwise use naive summarizer
	summary = None
	if _openai_available():
		summary = _summarize_with_openai(text)

	if not summary:
		summary = _naive_summarize(text)

	return jsonify({"summary": summary})

@app.route("/convert", methods=["POST"])
def convert():
	"""Accepts a multipart form `image` file (photo/scan of a newspaper) and returns
	the extracted text plus a short, elderly-friendly summary.

	Example (curl):
	  curl -F "image=@/path/to/photo.jpg" http://localhost:5000/convert
	"""
	if not (request.content_type and request.content_type.startswith("multipart/")):
		return jsonify({"error": "Content-Type must be multipart/form-data with field 'image'."}), 400

	if "image" not in request.files:
		return jsonify({"error": "No image provided. Send multipart form with field 'image'."}), 400

	image = request.files["image"]
	suffix = os.path.splitext(image.filename)[1] or ".png"
	with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
		image.save(tmp.name)
		tmp_path = tmp.name

	lang = request.form.get("lang")
	text, err = _ocr_image(tmp_path, lang=lang)
	if text is None:
		return jsonify({"status": "error", "message": err}), 501

	# Summarize the extracted text
	summary = None
	if _openai_available():
		summary = _summarize_with_openai(text)

	if not summary:
		summary = _naive_summarize(text)

	return jsonify({"text": text, "summary": summary})


@app.route("/fetch", methods=["POST"])
def fetch():
	"""Fetch a URL (or list of URLs) and return extracted text and summary.

	Request JSON: { "url": "https://..." } or { "urls": ["https://...", ...] }
	Returns JSON: { "results": [ { "url": ..., "text": ..., "summary": ..., "error": ... }, ... ] }
	"""
	data = None
	if request.is_json:
		data = request.get_json()
	else:
		# also accept form data
		data = request.form.to_dict()

	urls = []
	if isinstance(data, dict):
		if data.get("url"):
			urls = [data.get("url")]
		elif data.get("urls") and isinstance(data.get("urls"), list):
			urls = data.get("urls")
		elif data.get("urls") and isinstance(data.get("urls"), str):
			# allow comma-separated
			urls = [u.strip() for u in data.get("urls").split(",") if u.strip()]

	if not urls:
		return jsonify({"error": "No url(s) provided. Send JSON {\"url\": ...} or {\"urls\": [...] }"}), 400

	results = []
	for u in urls:
		entry = {"url": u}
		text, err = _fetch_and_extract(u)
		if text is None:
			entry["error"] = err
			results.append(entry)
			continue

		entry["text"] = text
		summary = None
		if _openai_available():
			summary = _summarize_with_openai(text)
		if not summary:
			summary = _naive_summarize(text)
		entry["summary"] = summary
		results.append(entry)

	return jsonify({"results": results})