# 12-07-2025Hackathon
Hrishi Ronnie Wyatt

## Deployment

This repository contains a small Flask backend in `backend/main.py` suitable for deploying to Railway.

Recommended files added (moved into `backend/`):
- `backend/Dockerfile` — containerizes the app (used by Railway or Docker locally)
- `backend/Procfile` — simple `web` start command (`python main.py`) when running from `backend/`
- `backend/.dockerignore` — keeps Docker build context small

Quick local Docker build & run (build from project root, using the `backend/` context):

```powershell
docker build -t elderly-news-app backend/
docker run -e PORT=5000 -p 5000:5000 elderly-news-app
```

Railway deploy (recommended, Docker):

1. Push your repo to GitHub.
2. In Railway, create a new project and connect your GitHub repository.
3. If your repository contains a Dockerfile in a subfolder, set the Dockerfile path in Railway to `backend/Dockerfile` (Railway's deploy settings allow specifying the Dockerfile path). Alternatively, use the Procfile if you prefer a non-Docker start command.
4. In Railway project settings add any required environment variables (for example `OPENAI_API_KEY` if you want OpenAI summarization).
5. Deploy and open the service URL provided by Railway.

Notes:
- The app reads the port from the `PORT` environment variable (Railway sets this automatically at runtime).
- If you want production-ready serving, consider using `gunicorn` and adding it to `backend/requirements.txt`, then update the `CMD` in `backend/Dockerfile` to use `gunicorn main:app --bind 0.0.0.0:$PORT`.
