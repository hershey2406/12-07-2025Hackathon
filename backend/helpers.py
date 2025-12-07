from flask import Flask, request, jsonify
import os
import tempfile
from dotenv import load_dotenv

load_dotenv()
app = Flask(__name__)

def _openai_available():
	"""Return True when an OpenAI API key is configured in the environment.

	This is used to decide whether summarization should call the remote
	OpenAI service or fall back to the local naive summarizer.
	"""
	return bool(os.getenv("OPENAI_API_KEY"))

def _ask_with_openai(prompt: str, context: str = None) -> str:
	"""Call OpenAI ChatCompletion to answer a user's prompt, optionally using a context string."""
	try:
		import openai
	except Exception:
		return None
	key = os.getenv("OPENAI_API_KEY")
	if not key:
		return None
	openai.api_key = key
	model = os.getenv("OPENAI_MODEL", "gpt-3.5-turbo")
	# Build messages: system instructions, optional context, then user prompt
	system = "You are a helpful assistant that answers questions in short, clear, friendly sentences suitable for elderly users. If context is provided, prefer answers informed by it and mention when you are guessing." 
	messages = [{"role": "system", "content": system}]
	if context:
		messages.append({"role": "user", "content": f"Context (do not invent facts):\n{context}"})
	messages.append({"role": "user", "content": prompt})
	try:
		resp = openai.ChatCompletion.create(model=model, messages=messages, max_tokens=300, temperature=0.4)
		return resp["choices"][0]["message"]["content"].strip()
	except Exception:
		return None
	

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





def _ocr_image(path: str, lang: str = None):
	"""Run OCR on an image file and return extracted text.

	This helper attempts to import `Pillow` and `pytesseract` and uses them to
	open the image and extract text. `lang` may be passed to tell Tesseract
	which language pack to use (e.g. 'eng' or 'spa').

	Returns a tuple `(text, None)` on success or `(None, error_message)` on
	failure so callers can handle errors uniformly.
	"""
	try:
		from PIL import Image
		import pytesseract
	except Exception as e:
		return None, f"Pillow/pytesseract not available: {e}"
	try:
		img = Image.open(path)
		config = f"-l {lang}" if lang else ""
		text = pytesseract.image_to_string(img, config=config)
		return text.strip(), None
	except Exception as e:
		return None, str(e)


def _allowed_by_robots(url: str, user_agent: str = "*") -> bool:
	"""Check the target site's robots.txt to see if fetching is allowed.

	Uses `urllib.robotparser` to read `/robots.txt` for the target host and
	returns True when the specified `user_agent` is allowed to fetch the URL.
	If robots.txt cannot be fetched/parsed we return True (permissive) to
	avoid blocking in environments where robots.txt is unavailable; change
	this policy if you prefer a conservative-deny approach.
	"""
	try:
		from urllib import robotparser
		from urllib.parse import urlparse
		parsed = urlparse(url)
		robots_url = f"{parsed.scheme}://{parsed.netloc}/robots.txt"
		rp = robotparser.RobotFileParser()
		rp.set_url(robots_url)
		rp.read()
		return rp.can_fetch(user_agent, url)
	except Exception:
		# If robots.txt can't be retrieved or parsed, allow by default
		return True


def _fetch_and_extract(url: str) -> tuple:
	"""Download a web page and extract the main article text.

	This function performs three steps:
	1. Checks robots.txt to respect publisher rules.
	2. Fetches the page HTML with `requests`.
	3. Uses `readability-lxml` to find the main content, then strips HTML
	   tags with BeautifulSoup and returns plain text.

	Returns `(text, None)` on success or `(None, error_message)` on failure.
	"""
	try:
		import requests
		from readability import Document
		from bs4 import BeautifulSoup
	except Exception as e:
		return None, f"Missing fetch/extract dependencies: {e}"

	# Respect robots.txt
	try:
		allowed = _allowed_by_robots(url)
		if not allowed:
			return None, "Fetching disallowed by robots.txt"
	except Exception:
		pass

	headers = {"User-Agent": "ElderlyNewsBot/1.0 (+https://example.com)"}
	try:
		resp = requests.get(url, headers=headers, timeout=10)
	except Exception as e:
		return None, f"Request failed: {e}"

	if resp.status_code != 200:
		return None, f"HTTP {resp.status_code}"

	try:
		doc = Document(resp.text)
		html = doc.summary()
		# strip tags to plain text
		soup = BeautifulSoup(html, "html.parser")
		text = soup.get_text(separator="\n").strip()
		return text, None
	except Exception as e:
		return None, f"Extraction failed: {e}"
	
def _find_top_match(headlines, keywords):
		"""Return the first headline that matches any keyword (title or description).

		Matching is case-insensitive. Returns None if no match found.
		"""
		if not isinstance(headlines, list):
			return None
		kws = [k.lower() for k in keywords]
		for a in headlines:
			title = (a.get("title") or "").lower()
			desc = (a.get("description") or "").lower()
			for kw in kws:
				if kw in title or kw in desc:
					return a
		return None

def _parse_published_at(item):
	"""Try to parse `publishedAt` from an article dict to a datetime for sorting."""
	ts = item.get("publishedAt") if isinstance(item, dict) else None
	if not ts:
		return None
	try:
		# NewsAPI often returns ISO8601 with trailing Z
		if ts.endswith("Z"):
			ts = ts.replace("Z", "+00:00")
		from datetime import datetime
		return datetime.fromisoformat(ts)
	except Exception:
		return None


def _find_top_matches(headlines, keywords, limit=3):
	"""Return up to `limit` headlines matching keywords, prefer most recent when possible."""
	if not isinstance(headlines, list):
		return []
	kws = [k.lower() for k in keywords]
	matches = []
	for a in headlines:
		title = (a.get("title") or "").lower()
		desc = (a.get("description") or "").lower()
		for kw in kws:
			if kw in title or kw in desc:
				matches.append(a)
				break
	# If articles include publishedAt, sort by it desc
	try:
		matches.sort(key=lambda x: _parse_published_at(x) or 0, reverse=True)
	except Exception:
		pass
	return matches[:limit]