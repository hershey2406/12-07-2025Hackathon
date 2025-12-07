# Railway Setup Guide - Frontend, Backend & Database Connection

Your application has three services on Railway:
- **proactive-success** (Frontend - Next.js/React)
- **abundant-surprise** (Backend - Flask)
- **Postgres** (Database)

## Step 1: Configure Backend to Accept Frontend Requests

✅ **Already done** - CORS is now enabled in `backend/application.py`

The backend accepts frontend requests from any origin by default. For production, configure:
```
ALLOWED_ORIGINS=https://proactive-success.up.railway.app,https://your-custom-domain.com
```

## Step 2: Configure Frontend Environment Variables

In your **proactive-success** service on Railway, add:

```
NEXT_PUBLIC_API_URL=https://abundant-surprise.up.railway.app
```

This tells your frontend where to find the backend API.

**Key point**: Only variables prefixed with `NEXT_PUBLIC_` are accessible in the browser.

## Step 3: Verify Service URLs

1. Go to Railway dashboard → dev environment
2. Click **abundant-surprise** (backend)
   - Copy the Domain URL (e.g., `https://abundant-surprise.up.railway.app`)
3. Click **proactive-success** (frontend)
   - Add environment variable: `NEXT_PUBLIC_API_URL=<backend-url>`
4. Click **Postgres**
   - DATABASE_URL is already shared with your backend via Railway's environment system

## Step 4: Test the Connection

**From Frontend:**
```javascript
// Example API call from your Next.js frontend
const response = await fetch(
  `${process.env.NEXT_PUBLIC_API_URL}/health`,
  {
    headers: { 'Content-Type': 'application/json' }
  }
);
```

**Expected Response**: `{"status": "ok"}`

## Database Connection Flow

```
Frontend (proactive-success) 
  → API calls to Backend (abundant-surprise)
    → Database queries to Postgres
```

The frontend never connects directly to the database - all database access goes through your backend API.

## Common API Endpoints Available

From your backend routes:
- `GET /health` - Health check
- `POST /news` - Summarize news text
- `GET /today` - Get today's articles
- `GET /headlines` - Get headlines for a date
- `POST /fetch` - Fetch and summarize from URL
- `GET /ask` - Ask questions about news

## Troubleshooting

**"Connection refused" from frontend:**
- Check that `NEXT_PUBLIC_API_URL` is set correctly in proactive-success
- Verify the backend URL is accessible (test in browser)
- Check CORS is enabled (should see `Access-Control-Allow-Origin` headers)

**Database connection issues:**
- Backend automatically uses `DATABASE_URL` from Railway environment
- Migrations run via Procfile release command
- Check Railway logs for migration errors

**Frontend can't find backend:**
- Ensure NEXT_PUBLIC_API_URL includes the full domain with `https://`
- Don't use `http://` or `localhost` in production URLs
