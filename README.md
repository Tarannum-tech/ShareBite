# ShareBite — React + Express + MongoDB

A responsive React/Vite frontend with an Express/Mongoose API. Donation, request and delivery changes are saved in MongoDB when the backend is running. The frontend keeps its local browser cache as a fallback if the API is unavailable.

## Requirements
- Node.js 18+
- MongoDB local instance or MongoDB Atlas connection string

## Run it
1. Open a terminal in `sharebite-backend`.
2. Run `npm install`. Copy `.env.example` to `.env` and set `MONGO_URI` to your MongoDB connection string. Do not commit `.env`.
3. Start the API with `npm run dev` (port 5000). Check `http://localhost:5000/api/health`.
4. In another terminal, open the project root and run `npm install`, then `npm run dev`. Vite runs on port 5173 and proxies `/api` to port 5000.
5. Open the URL printed by Vite. Choose a demo role and name to use the role-based workspace.

## Working flows
- Donors can publish donations.
- Charities/needy users can request available donations; duplicate active requests are rejected by the API.
- Charities can approve requests and create delivery tasks.
- Volunteers can update delivery status.
- Overview and impact screens use the current donation/request/delivery data.

## Notes
Role selection is a demo sign-in, not production authentication. Before public deployment, add authenticated accounts and role authorization, validate food safety/expiry, protect the database, and configure CORS for the deployed frontend domain.

## Secure sign-in update

The React portal now starts with **Sign in / Create account**. User accounts are stored in MongoDB, and passwords are salted and hashed with Node.js `crypto.scrypt`; plaintext passwords are never saved. API data routes require a signed, expiring bearer token.

Before starting the backend, add a `JWT_SECRET` value to `sharebite-backend/.env` (use a long random secret of at least 32 characters). Keep `.env` private and never commit it to GitHub. Example:

```env
MONGO_URI=your_existing_mongodb_connection_string
JWT_SECRET=put-a-long-random-secret-here-at-least-32-characters
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
```

The **Status dashboard** page summarizes donation, request and delivery statuses in one place. Donation cards now include food photography; an internet connection is required to load those images.

## UI redesign
The interface was redesigned (landing page, dashboard, food-photo cards, delivery cards, status and impact screens). Only `src/App.jsx` presentation markup and `src/styles.css` changed; all state, API calls, roles and workflows are unchanged. Food photos load from Unsplash (internet needed). If a photo cannot load, a colour-gradient placeholder is shown automatically. To use your own photos, edit `FOOD_POOLS` / `SCENE` near the "Photos" section of `src/App.jsx`.
