from flask import Flask, request, jsonify
import os
import tempfile
from dotenv import load_dotenv
from .helpers import _openai_available, _summarize_with_openai, _naive_summarize, _ocr_image, _fetch_and_extract, _ask_with_openai, _find_top_match, _parse_published_at, _find_top_matches
import json
from datetime import date
# Prefer SQLAlchemy models when available so we can use db.session instead of raw sqlite3.
try:
	from .models import db as models_db, Day, DayArticle, Article
except Exception:
	models_db = None

# Path to the SQLite DB used by pushnews.py. Can be overridden with DB_PATH env var.
DB_PATH = os.getenv("DB_PATH") or os.path.join(os.path.dirname(__file__), "today.db")

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


def _read_today_row(db_path: str, target_date: str):
	"""Read the headlines for `target_date` from the DB.

	Strategy:
	  - Prefer normalized tables (`days`/`day_articles`/`articles`) when present.
	  - Fall back to legacy `Today` table that stores a JSON string in `headlines`.
	Returns (headlines_list_or_text, None) on success or (None, error_message).
	"""
	# ORM-only path: require SQLAlchemy models initialized and bound to the app.
	if models_db is None:
		return None, "ORM not initialized; set up SQLAlchemy and initialize models.db with your Flask app"
	try:
		session = models_db.session
		q = (
			session.query(Article.url, Article.title, Article.description, Article.content, Article.source_name, Article.published_at)
			.join(DayArticle, DayArticle.article_id == Article.id)
			.join(Day, Day.id == DayArticle.day_id)
			.filter(Day.date == target_date)
			.order_by(DayArticle.rank.asc())
		)
		rows = q.all()
		if not rows:
			return None, None
		headlines = []
		for (url, title, description, content, source_name, published_at) in rows:
			headlines.append({
				"url": url,
				"title": title,
				"description": description,
				"content": content,
				"source": {"name": source_name} if source_name else None,
				"publishedAt": published_at,
			})
		return headlines, None
	except Exception as e:
		return None, str(e)


@app.route("/today", methods=["GET"])
def get_today():
	"""Return today's headlines from the Today table.

	Optional query param `date=YYYY-MM-DD` can be used to retrieve a specific
	date instead of today's date.
	"""
	requested = request.args.get("date")
	if not requested:
		requested = date.today().isoformat()

	headlines, err = _read_today_row(DB_PATH, requested)
	if err:
		return jsonify({"error": err}), 500
	if headlines is None:
		return jsonify({"error": "No headlines found for date", "date": requested}), 404
	return jsonify({"date": requested, "headlines": headlines})


@app.route("/today/list", methods=["GET"])
def list_available_dates():
	"""Return a list of dates that have rows in the Today table."""
	# ORM-only: require models_db to be initialized
	if models_db is None:
		return jsonify({"error": "ORM not initialized; configure SQLAlchemy and call models.db.init_app(app)"}), 500
	try:
		session = models_db.session
		rows = session.query(Day.date).order_by(Day.date.desc()).all()
		dates = [r[0] for r in rows]
		return jsonify({"dates": dates})
	except Exception as e:
		return jsonify({"error": str(e)}), 500


@app.route("/today/summary", methods=["GET"])
def summarize_today():
	"""Return a short, elderly-friendly summary of today's US headlines.

	Optional query params:
	  - `date=YYYY-MM-DD` to summarize a specific date (defaults to today)
	  - `max_articles` integer to limit how many headlines to include (default 10)
	"""
	requested = request.args.get("date")
	if not requested:
		requested = date.today().isoformat()

	try:
		max_articles = int(request.args.get("max_articles", 10))
	except Exception:
		max_articles = 10

	headlines, err = _read_today_row(DB_PATH, requested)
	if err:
		return jsonify({"error": err}), 500
	if headlines is None:
		return jsonify({"error": "No headlines found for date", "date": requested}), 404

	# headlines is expected to be a list of article dicts (title/description/url)
	if isinstance(headlines, list):
		items = headlines[:max_articles]
		# build a single text blob from titles + descriptions
		parts = []
		for a in items:
			title = a.get("title") or ""
			desc = a.get("description") or ""
			parts.append(f"{title}. {desc}")
		combined = "\n\n".join(parts)
	else:
		# if stored as plain text, summarize it directly
		combined = str(headlines)

	# limit combined length to avoid sending huge text to the summarizer
	max_input_chars = 4000
	if len(combined) > max_input_chars:
		combined = combined[:max_input_chars].rsplit(" ", 1)[0] + "..."

    #hope open ai is available
	summary = None
	if _openai_available():
		summary = _summarize_with_openai(combined)

	if not summary:
		summary = _naive_summarize(combined, max_chars=500)

	return jsonify({"date": requested, "summary": summary, "count": len(items) if isinstance(headlines, list) else 1})



@app.route("/ask", methods=["POST"])
def ask():
	"""Answer a user's question from a typed prompt.

	JSON body: { "prompt": "...", "date": "YYYY-MM-DD" (optional) }
	If `date` is provided, headlines for that date (or today) are used as context.
	Uses OpenAI when `OPENAI_API_KEY` is configured; otherwise falls back to a
	simple headline-matching response.
	"""
	if not request.is_json:
		return jsonify({"error": "Send JSON with field 'prompt'"}), 400
	data = request.get_json()
	prompt = data.get("prompt")
	if not prompt:
		return jsonify({"error": "Missing 'prompt' in request body"}), 400

	# Optional date context
	target_date = data.get("date") or date.today().isoformat()
	context_headlines, err = _read_today_row(DB_PATH, target_date)
	context_text = None
	if err:
		# ignore DB errors for context, continue without context
		context_headlines = None
	if isinstance(context_headlines, list) and context_headlines:
		# build a short context from titles+descriptions
		parts = []
		for a in context_headlines[:10]:
			t = a.get("title") or ""
			d = a.get("description") or ""
			parts.append(f"{t}. {d}")
		context_text = "\n\n".join(parts)

	answer = None
	if _openai_available():
		# try to use OpenAI with context when available
		answer = _ask_with_openai(prompt, context=context_text)

	if not answer:
		# Fallback: simple headline keyword matching
		reply_parts = []
		if isinstance(context_headlines, list):
			q = prompt.lower()
			for a in context_headlines:
				title = (a.get("title") or "").lower()
				desc = (a.get("description") or "").lower()
				if any(tok in title or tok in desc for tok in q.split() if len(tok) > 3):
					reply_parts.append({"title": a.get("title"), "url": a.get("url"), "description": a.get("description")})
		if reply_parts:
			return jsonify({"source": "headlines_fallback", "matches": reply_parts})
		return jsonify({"error": "No model available to answer this question. Set OPENAI_API_KEY for full answers."}), 503

	return jsonify({"answer": answer, "date_context": target_date if context_text else None})



@app.route("/today/economy", methods=["GET"])
def today_economy_top():
	"""Return the single top US economic/business headline for today (or date)."""
	requested = request.args.get("date") or date.today().isoformat()
	headlines, err = _read_today_row(DB_PATH, requested)
	if err:
		return jsonify({"error": err}), 500
	if headlines is None:
		return jsonify({"error": "No headlines found for date", "date": requested}), 404

	econ_keywords = [
		"econom", "inflation", "stock", "market", "dow", "s&p", "jobs", "unemployment",
		"fed", "interest", "rate", "gdp", "recession", "business", "finance", "bank", "stocks"
		]
	match = _find_top_match(headlines, econ_keywords)
	if not match:
		return jsonify({"error": "No economy headline found for date", "date": requested}), 404
	return jsonify({"date": requested, "category": "economy", "article": match})


@app.route("/today/health", methods=["GET"])
def today_health_top():
	"""Return the single top US health-related headline for today (or date)."""
	requested = request.args.get("date") or date.today().isoformat()
	headlines, err = _read_today_row(DB_PATH, requested)
	if err:
		return jsonify({"error": err}), 500
	if headlines is None:
		return jsonify({"error": "No headlines found for date", "date": requested}), 404
	health_keywords = [
	"health", "covid", "vaccine", "hospital", "doctor", "medical", "disease", "illness", "flu", "mental"
	]
	match = _find_top_match(headlines, health_keywords)
	if not match:
		return jsonify({"error": "No health headline found for date", "date": requested}), 404
	return jsonify({"date": requested, "category": "health", "article": match})


@app.route("/today/defense", methods=["GET"])
def today_defense_top():
	"""Return the single top US defense/war-related headline for today (or date)."""
	requested = request.args.get("date") or date.today().isoformat()
	headlines, err = _read_today_row(DB_PATH, requested)
	if err:
		return jsonify({"error": err}), 500
	if headlines is None:
		return jsonify({"error": "No headlines found for date", "date": requested}), 404

	defense_keywords = [
		"war", "attack", "military", "troop", "invasion", "missile", "airstrike", "conflict", "battle", "casualties",
		"russia", "ukraine", "israel", "gaza", "palestine", "taliban", "afghanistan"
	]
	match = _find_top_match(headlines, defense_keywords)
	if not match:
		return jsonify({"error": "No defense headline found for date", "date": requested}), 404
	return jsonify({"date": requested, "category": "defense", "article": match})





@app.route("/today/economy/top3", methods=["GET"])
def today_economy_top3():
	requested = request.args.get("date") or date.today().isoformat()
	limit = int(request.args.get("limit", 3))
	headlines, err = _read_today_row(DB_PATH, requested)
	if err:
		return jsonify({"error": err}), 500
	if headlines is None:
		return jsonify({"error": "No headlines found for date", "date": requested}), 404
	econ_keywords = [
		"econom", "inflation", "stock", "market", "dow", "s&p", "jobs", "unemployment",
		"fed", "interest", "rate", "gdp", "recession", "business", "finance", "bank", "stocks"
	]
	matches = _find_top_matches(headlines, econ_keywords, limit=limit)
	return jsonify({"date": requested, "category": "economy", "count": len(matches), "articles": matches})


@app.route("/today/health/top3", methods=["GET"])
def today_health_top3():
	requested = request.args.get("date") or date.today().isoformat()
	limit = int(request.args.get("limit", 3))
	headlines, err = _read_today_row(DB_PATH, requested)
	if err:
		return jsonify({"error": err}), 500
	if headlines is None:
		return jsonify({"error": "No headlines found for date", "date": requested}), 404
	health_keywords = [
		"health", "covid", "vaccine", "hospital", "doctor", "medical", "disease", "illness", "flu", "mental"
	]
	matches = _find_top_matches(headlines, health_keywords, limit=limit)
	return jsonify({"date": requested, "category": "health", "count": len(matches), "articles": matches})


@app.route("/today/defense/top3", methods=["GET"])
def today_defense_top3():
	requested = request.args.get("date") or date.today().isoformat()
	limit = int(request.args.get("limit", 3))
	headlines, err = _read_today_row(DB_PATH, requested)
	if err:
		return jsonify({"error": err}), 500
	if headlines is None:
		return jsonify({"error": "No headlines found for date", "date": requested}), 404
	defense_keywords = [
		"war", "attack", "military", "troop", "invasion", "missile", "airstrike", "conflict", "battle", "casualties",
		"russia", "ukraine", "israel", "gaza", "palestine", "taliban", "afghanistan"
	]
	matches = _find_top_matches(headlines, defense_keywords, limit=limit)
	return jsonify({"date": requested, "category": "defense", "count": len(matches), "articles": matches})


@app.route("/article/summary", methods=["GET", "POST"])
def article_summary():
	"""Summarize a specific article identified by `url`.

	Accepts either GET with query `?url=...&date=YYYY-MM-DD` or POST JSON {"url": "...", "date": "YYYY-MM-DD"}.
	If `date` is provided the search will be limited to that date; otherwise today's headlines are searched first then all dates.
	If the stored article lacks full content, the endpoint will attempt to fetch the article URL to extract text.
	"""
	# get url from GET or POST JSON
	url = None
	requested_date = None
	if request.method == "GET":
		url = request.args.get("url")
		requested_date = request.args.get("date")
	else:
		if not request.is_json:
			return jsonify({"error": "Send JSON with field 'url'"}), 400
		data = request.get_json()
		url = data.get("url")
		requested_date = data.get("date")

	if not url:
		return jsonify({"error": "Missing 'url' parameter"}), 400

	# helper to search headlines for a date
	def _search_date_for_url(target_date):
		headlines, err = _read_today_row(DB_PATH, target_date)
		if err or not headlines:
			return None
		if isinstance(headlines, list):
			for a in headlines:
				if a.get("url") == url:
					return a
		return None

	article = None
	# if date provided, search only that date
	if requested_date:
		article = _search_date_for_url(requested_date)
		search_date = requested_date
	else:
		# search today's headlines first
		today_str = date.today().isoformat()
		article = _search_date_for_url(today_str)
		search_date = today_str
		if not article:
			# ORM-only: require models_db and attempt to find the article by URL across days
			if models_db is None:
				return jsonify({"error": "ORM not initialized; configure SQLAlchemy and call models.db.init_app(app)"}), 500
			try:
				session = models_db.session
				row = (
					session.query(Day.date, Article.url, Article.title, Article.description, Article.content, Article.source_name, Article.published_at)
					.join(DayArticle, Day.id == DayArticle.day_id)
					.join(Article, Article.id == DayArticle.article_id)
					.filter(Article.url == url)
					.first()
				)
				if row:
					d, u, title, description, content, source_name, published_at = row
					article = {"url": u, "title": title, "description": description, "content": content, "source": {"name": source_name} if source_name else None, "publishedAt": published_at}
					search_date = d
			except Exception as e:
				return jsonify({"error": f"DB error: {e}"}), 500

	if not article:
		return jsonify({"error": "Article not found in stored headlines", "url": url}), 404

	# Determine text to summarize
	text = None
	if article.get("content"):
		text = article.get("content")
	elif article.get("description"):
		text = article.get("description")
	elif article.get("title"):
		text = article.get("title")

	if (not text or len(text) < 80) and article.get("url"):
		# try to fetch full article text
		fetched_text, err = _fetch_and_extract(article.get("url"))
		if fetched_text:
			text = fetched_text

	if not text:
		return jsonify({"error": "No text available to summarize for this article", "article": article}), 422

	# cap input size
	max_input = 6000
	if len(text) > max_input:
		text = text[:max_input].rsplit(" ", 1)[0] + "..."

	summary = None
	source = "none"
	if _openai_available():
		summary = _summarize_with_openai(text)
		source = "openai" if summary else source

	if not summary:
		summary = _naive_summarize(text, max_chars=400)
		source = "naive"

	return jsonify({"date": search_date, "url": url, "summary": summary, "source": source, "article": article})