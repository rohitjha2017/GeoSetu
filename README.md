# AI-Assisted Disaster Risk & Relocation Platform (SIH Prototype)

A functional decision-support prototype demonstrating: **Flood scenario → Risk zones →
Vulnerable villages → Relocation priority → Suitable relocation sites → Capacity
assessment → AI-assisted explanation**, using a Bihar / Koshi river flooding scenario.

> **This is a scenario-based prototype.** All risk scores, flood zones, and relocation
> figures come from a deterministic demo scoring model, not a real hydrological
> forecast. Village, site, and service data is clearly-marked demo/prototype data.

---

## 1. Project structure

```
project/
├── client/      React + Vite + Tailwind + Leaflet + Recharts frontend
├── server/      Node + Express + (in-memory or MongoDB) backend
└── README.md
```

## 2. Quick start (recommended — no database required)

The backend runs in **memory mode** by default: it loads the seed JSON straight into
memory, so you can run the whole demo with zero infrastructure setup.

### Backend

```bash
cd server
cp .env.example .env
npm install
npm run dev
```

Server starts at `http://localhost:4000`. Check `http://localhost:4000/api/health`.

### Frontend

```bash
cd client
npm install
npm run dev
```

Frontend starts at `http://localhost:5173` and proxies `/api/*` to the backend.

Open `http://localhost:5173` in your browser.

### Optional: enable the AI Copilot

The Copilot works out of the box with a data-only fallback (no external calls) if no
API key is set. To enable real LLM-generated explanations, add your Anthropic API key
to `server/.env`:

```
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-sonnet-4-6
```

### Optional: run against real MongoDB

Set `DATA_MODE=mongo` and `MONGO_URI=...` in `server/.env`. On startup the server will
upsert the same seed data into MongoDB via Mongoose and read/write through it instead
of the in-memory store — no application code changes required.

### Demo login (Authority Mode)

By default Authority routes are open (no login) so judges can walk straight into the
dashboard. A demo login endpoint also exists:

- Email: `officer@demo.bihar.gov.in`
- Password: `demo1234`

Set `REQUIRE_AUTH=true` in `server/.env` to enforce login on API routes.

---

## 3. Demo flow (3–5 minutes)

1. Open **Authority Dashboard** (`/authority`) — see monitored villages, risk
   breakdown, affected population, and relocation capacity.
2. Go to **GIS Risk Map** (`/authority/map`) and move the **Koshi water-level slider**
   — watch risk zones and village markers shift Yellow → Orange → Red live.
3. Click a **Red-zone village** marker to open its analysis page — population,
   vulnerability, relocation priority.
4. Click **"Find Suitable Relocation Sites"** — see ranked candidate sites (Safety,
   Capacity, Accessibility, Healthcare, Education, Water), capacity breakdown, and the
   post-relocation trade-off comparison.
5. Click through to the **AI Copilot** and ask *"Why is Site A recommended?"* or use
   a suggested question chip.
6. Switch to **Public Mode** (`/public`), search the same village, see its risk +
   precautions + nearest safe location.
7. Turn off your network connection (or DevTools → Network → Offline) and reload —
   Public Mode shows the **"OFFLINE — Showing last synchronized information"** banner
   using data cached in IndexedDB / the service worker.

---

## 4. Architecture notes

- **`server/src/services/riskEngine.js`** — isolated, documented, weighted scenario
  risk model (flood exposure, elevation, river proximity, historical exposure,
  vulnerability). Thresholds and weights are configurable constants, designed to be
  swapped for a real ML model later without touching routes/controllers.
- **`server/src/services/relocationEngine.js`** — weighted candidate-site suitability
  ranking (safety, capacity, accessibility, healthcare, education, water).
- **`server/src/services/capacityEngine.js`** — practical carrying capacity bounded by
  the weakest infrastructure factor.
- **`server/src/services/floodZoneService.js`** — generates illustrative buffer-zone
  polygons around the river centerline that scale with the scenario water level, for
  map visualization only (not a hydrological inundation model).
- **`server/src/services/copilot.js`** — always retrieves real application data first
  (via the other engines) and only then calls the LLM with that data as structured
  JSON context, so the model explains real numbers rather than inventing them. Falls
  back to a deterministic, data-only summary if no API key is configured.
- **`server/src/services/dataStore.js`** — single data-access abstraction so the rest
  of the app never talks to JSON files or Mongoose models directly. Swappable between
  in-memory demo mode and MongoDB via `DATA_MODE`.
- **Offline support** — `client/src/services/offlineStore.js` (IndexedDB) persists the
  structured data a citizen has already viewed for offline reuse, with a visible
  "last synchronized" indicator; `vite-plugin-pwa` (Workbox/service worker + Cache
  API) additionally caches read-only public API responses and map tiles.

## 5. Data

All seed data (`server/src/seed/*.json`) is clearly-marked prototype/demo data
covering Saharsa, Supaul, Madhepura, and Khagaria districts along the Koshi river. It
is structured so real, verified Bihar/Koshi datasets can be substituted later without
rewriting the application — replace the JSON (or point `DATA_MODE=mongo` at a
populated database) and the risk/relocation/capacity engines work unchanged.

## 6. Future scope (explicitly out of scope for this prototype)

- Real-time / production flood forecasting (this prototype uses a scenario slider,
  not live sensor or satellite data).
- Verified survey-grade elevation, hydrology, and population datasets.
- Production authentication, role management, and audit logging for Authority users.
