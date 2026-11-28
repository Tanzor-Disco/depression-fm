# depression-fm

depression-fm is a web app for discovering sad music. Click the discovery button to get a random song from the collection. The track card shows the title, artist, cover art, a short description, and a link to Spotify. Click again to discover another track.

## Project structure

| Directory | Purpose |
| --- | --- |
| [`frontend/`](frontend/) | React, TypeScript, and Vite interface. The first request runs when the user clicks the discovery button. If a later request fails, the previous track stays on screen. |
| [`backend/`](backend/) | FastAPI and PostgreSQL. `GET /api/songs/random` returns a random track or HTTP 404 if the collection is empty. |
| [`integration/`](integration/) | Python service that syncs the collection with a CSV source and generates track descriptions through a model API. Sync starts immediately and waits five minutes between attempts. |
| [`migrations/`](migrations/) | PostgreSQL migrations applied at startup by Docker Compose. |
| [`nginx/`](nginx/) | Nginx serves the frontend build and proxies `/api/` requests to FastAPI. |

## Run with Docker Compose

Install Docker and Docker Compose, then create a `.env` file in the project root.

```sh
cp .env.example .env
```

Set `POSTGRES_USER`, `POSTGRES_PASSWORD`, and `POSTGRES_DB` to configure PostgreSQL. To populate the track collection, set `TRACKS_CSV_URL` to a direct download link for your tracks CSV and `MODEL_URL` to your model provider’s API base URL. Set `MODEL_NAME` and `MODEL_API_KEY` in the same `.env` file before starting Docker Compose.

| Variable | Value |
| --- | --- |
| `TRACKS_CSV_URL` | Direct URL to a CSV file, such as a Google Sheets export. Use the columns `title,artist,image_url,spotify_url`. |
| `MODEL_URL` | Base URL of an API that supports the OpenAI Responses API with structured outputs. |
| `MODEL_NAME` | Model name used by your provider. |
| `MODEL_API_KEY` | API key for the model provider. |

```sh
docker compose up --build -d
```

Open [http://localhost](http://localhost). On a fresh database, tracks become available after the first successful sync. Check sync progress with `docker compose logs integration`.

To open the app without a CSV source or model API key, run `docker compose up --build -d nginx`. With a fresh database, the discovery button will show the empty collection state.

## Frontend development

Use Node.js 24. If the project is running through Docker Compose, point Vite at Nginx.

```sh
cd frontend
npm ci
API_PROXY_TARGET=http://localhost npm run dev
```

Open [http://localhost:5173](http://localhost:5173). If you run the backend separately, Vite proxies `/api` requests to `http://localhost:8080` by default. See the [frontend README](frontend/README.md) for more configuration options.

Run the frontend checks from `frontend/`.

```sh
npm run build
npm run format:check
npx playwright install chromium
npm test
```

Playwright mocks API responses, so the tests can run without the backend, a database, or a model API key.
