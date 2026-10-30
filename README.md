# Threadline

Threadline is a small customer inquiry workspace for service staff. It covers the complete workflow: sign in, capture an inquiry, find it later, and move it between New, In progress, and Resolved.

## Stack

- Frontend: React + TypeScript + Vite
- Backend: Node.js + Express
- Database: PostgreSQL 16
- Validation/auth: Zod, bcrypt, JWT

## Run locally

Prerequisites: Node.js 20+, npm, and Docker Desktop.

1. Start PostgreSQL and create the schema/seed accounts:

```powershell
docker compose up -d
```

2. Install and start the API:

```powershell
cd backend
Copy-Item .env.example .env
npm install
npm run dev
```

3. Install and start the frontend in a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

The API runs at `http://localhost:4000`. Set `VITE_API_URL` if the API is hosted elsewhere.

## Demo accounts

- `maya@example.com` / `password123`
- `jon@example.com` / `password123`

Each account sees only its own inquiries. This is enforced by `owner_id` conditions in every protected inquiry query, not by the frontend.

## Tests

```powershell
cd backend; npm test
cd ../frontend; npm test
npm run build
```

The backend tests cover independent input validation. The frontend test covers the failed-login feedback state. The remaining gap is a live PostgreSQL/API integration test; the API contract is small enough to add one with a disposable database in a production CI setup.

## Submission notes

See [DECISIONS.md](DECISIONS.md) for assumptions, trade-offs, stale data handling, and AI-use transparency. A screen recording should demonstrate sign-in, creating an inquiry, filtering/opening it, changing status, and one invalid form/login case.
