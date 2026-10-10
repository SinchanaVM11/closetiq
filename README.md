# ClosetIQ

ClosetIQ is a small MERN wardrobe studio that helps people organize clothes they already own, compose explainable outfits, and compare an inspiration look against their collection. It is deliberately practical: deterministic recommendations come from MongoDB wardrobe data, while optional AI imagery turns a selected outfit and styling brief into an editorial flat-lay and a cartoon model preview.

## Features

- MongoDB-backed wardrobe CRUD: add, edit, search, filter, preview, and delete garments.
- Validation for garment name, category, color, style, occasions, and image uploads/URLs.
- Style Me flow with occasion, style/mood, and free-text intent.
- Deterministic recommendations scored by occasion, style, color compatibility, weather, and freshness.
- Recreate This Look flow with local inspiration preview, manually confirmed attributes, closest owned matches, and missing-category reporting.
- Optional server-side OpenAI image generation for a selected outfit; the API key never reaches the browser.
- Responsive iced cold coffee editorial UI with accessible focus states and reduced-motion support.
- Render Blueprint deploying the Express API and Vite static frontend from one repository.

## Technologies

- React 19 + Vite
- Node.js + Express 5
- MongoDB + Mongoose
- OpenAI Images API (optional)
- Render Blueprint

## Repository structure

```text
client/
  src/App.jsx              # page composition and reusable UI components
  src/services/api.js      # browser-to-API boundary
  src/utils/recommendation.js
server/
  src/models/              # Mongoose schemas
  src/controllers/         # request handlers
  src/routes/              # REST endpoints
  src/services/            # recommendation domain logic
render.yaml                # two-service Render deployment
```

## Local setup

Requirements: Node.js 18+ and a MongoDB Atlas (or local MongoDB) database.

```bash
git clone https://github.com/SinchanaVM11/closetiq.git
cd closetiq

cd server
npm ci
cp .env.example .env
# Set MONGODB_URI in server/.env.
npm run dev
```

In another terminal:

```bash
cd client
npm ci
npm run dev
```

The frontend runs at `http://localhost:5173`; the API runs at `http://localhost:5050`. The client defaults to `http://localhost:5050/api`, or uses `VITE_API_BASE_URL` when supplied.

To enable image generation locally, add `OPENAI_API_KEY` to `server/.env`. `IMAGE_MODEL` is optional and defaults to `gpt-image-1`. The app remains fully usable without this key.

## API overview

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | API and database status |
| GET/POST | `/api/garments` | List or create wardrobe pieces |
| GET/PUT/DELETE | `/api/garments/:id` | Read, edit, or remove a piece |
| POST | `/api/outfits/recommend` | Score combinations from owned garments |
| POST | `/api/images/outfit` | Optional AI flat-lay and model images |

## Render deployment

Use **New → Blueprint** and select this repository. Render reads `render.yaml` and creates:

- `closetiq-api`: Node service rooted at `server`, built with `npm ci`, started with `npm start`.
- `closetiq-web`: static site rooted at `client`, built with `npm ci && npm run build`, publishing `dist`.

The Blueprint wires `VITE_API_BASE_URL` to the API's Render hostname and `CLIENT_URL` to the frontend hostname. Add these secret values in Render when prompted:

- `MONGODB_URI`: complete MongoDB Atlas connection string.
- `OPENAI_API_KEY`: optional OpenAI key for AI imagery.

Do not commit `.env` files, database passwords, or API keys. Render supplies `PORT` automatically.

## AI development experience

This implementation was developed with the **GitHub Copilot App**, which was the available AI development environment for this repository. It was not developed with Code0 or Kiro; this is stated explicitly rather than claiming tool usage that did not occur.

AI-assisted work included:

1. Component and page architecture for Wardrobe, Style Me, and Recreate This Look.
2. Express/Mongoose CRUD and deterministic recommendation integration.
3. Debugging the stale Vite checkout and validating the active frontend build.
4. Adding the server-side OpenAI image-generation route without exposing secrets.
5. Creating and validating the Render Blueprint and deployment configuration.

All generated changes were inspected, adapted to the existing API contract, and validated with the client build/lint commands and Node syntax checks.
