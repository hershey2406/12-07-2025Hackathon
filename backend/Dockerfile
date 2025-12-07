FROM python:3.11-slim

WORKDIR /app

# Install system deps (if you need ffmpeg/sox for audio, add here)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    tesseract-ocr \
    libxml2-dev \
    libxslt1-dev \
    zlib1g-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy app
COPY . .

ENV PYTHONUNBUFFERED=1

# Railway provides $PORT at runtime; default to 5000 if not set
ENV PORT=5000

EXPOSE 5000

# Use gunicorn for production WSGI serving. `GUNICORN_WORKERS` can be set as an env var.
ENV GUNICORN_WORKERS=2

CMD ["gunicorn", "main:app", "--bind", "0.0.0.0:$PORT", "--workers", "${GUNICORN_WORKERS}"]
