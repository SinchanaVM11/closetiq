# ClosetIQ

ClosetIQ is a React/Vite wardrobe frontend backed by an Express/MongoDB API. The repository includes a Render Blueprint at [`render.yaml`](./render.yaml) that deploys both services from this repository:

- `closetiq-api`: Node web service rooted at `server`, using `npm ci` and `npm start`
- `closetiq-web`: static site rooted at `client`, using `npm ci && npm run build` and publishing `dist`

## One-step Render setup

1. In Render, choose **New → Blueprint** and select this GitHub repository and branch.
2. During Blueprint setup, provide the secret `MONGODB_URI` for `closetiq-api`. Use a MongoDB Atlas connection string and allow Render's outbound access in the Atlas Network Access rules.
3. Provide `OPENAI_API_KEY` for `closetiq-api` only if Style Me image generation is wanted. It is optional; wardrobe and deterministic recommendations work without it.
4. Keep the generated service names or update both names consistently in `render.yaml`; the `RENDER_EXTERNAL_HOSTNAME` references connect the frontend build to the API and configure API CORS without hardcoded public URLs.

`PORT` is supplied by Render and is used by the API. `CLIENT_URL` and `VITE_API_BASE_URL` are generated from the other service's public hostname. Do not commit `.env` files or secrets; local development continues to use `server/.env` and the Vite fallback `http://localhost:5050/api`.
