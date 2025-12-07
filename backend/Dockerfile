FROM python:3.11-slim

WORKDIR /app

# Install system deps (if you need ffmpeg/sox for audio, add here)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
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

CMD ["python", "main.py"]
