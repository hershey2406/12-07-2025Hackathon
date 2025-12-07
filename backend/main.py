from flask import Flask, request, jsonify
import os
import tempfile
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)


def _openai_available():
	return bool(os.getenv("OPENAI_API_KEY"))


def _summarize_with_openai(text: str) -> str:
	"""If `OPENAI_API_KEY` is set, use OpenAI to create a short, elderly-friendly summary.
	Returns None if the OpenAI key is not configured or if the call fails.
	"""
	key = os.getenv("OPENAI_API_KEY")
	if not key:
		return None
	try:
		import openai
		openai.api_key = key
		model = os.getenv("OPENAI_MODEL", "gpt-3.5-turbo")
		response = openai.ChatCompletion.create(
			model=model,
			messages=[
				{"role": "system", "content": "You are an assistant that summarizes news in short, clear, friendly sentences suitable for elderly users."},
				{"role": "user", "content": f"Summarize the following for an elderly reader, keep it concise and use simple language:\n\n{text}"},
			],
			max_tokens=300,
			temperature=0.5,
		)
		return response["choices"][0]["message"]["content"].strip()
	except Exception:
		return None


def _naive_summarize(text: str, max_chars: int = 400) -> str:
	"""Simple fallback summarizer: return the first few sentences up to max_chars."""
	text = text.strip()
	if len(text) <= max_chars:
		return text
	# try to cut at sentence boundary
	import re
	sentences = re.split(r'(?<=[.!?])\s+', text)
	out = ""
	for s in sentences:
		if len(out) + len(s) + 1 > max_chars:
			break
		out += (s + " ")
	if not out:
		out = text[:max_chars].rsplit(" ", 1)[0] + "..."
	return out.strip()


@app.route("/health", methods=["GET"])
def health():
	return jsonify({"status": "ok"})


@app.route("/news", methods=["POST"])
def news():
	"""Accepts either JSON with `text` or a multipart upload with field `audio`.

	- If `text` is provided, returns a short summary (uses OpenAI if `OPENAI_API_KEY` is set).
	- If `audio` is uploaded, returns a helpful message explaining STT isn't enabled yet.
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


if __name__ == "__main__":
	port = int(os.getenv("PORT", 5000))
	debug = os.getenv("FLASK_DEBUG", "1") in ("1", "true", "True")
	app.run(host="0.0.0.0", port=port, debug=debug)