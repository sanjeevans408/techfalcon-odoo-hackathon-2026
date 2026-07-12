# AssetFlow

AssetFlow is an asset-management ERP built with React, Vite, Express, and SQLite. It manages assets, users, allocations, transfers, bookings, maintenance, audits, notifications, activity logs, and an optional AI assistant.

## Requirements

- Node.js 18 or later
- npm

## Install

Install both frontend and backend dependencies from the project root:

```powershell
npm.cmd run install:all
```

Create the SQLite schema and seed sample records:

```powershell
cd backend
npm.cmd run seed
cd ..
```

## Configure environment variables

Create `backend/.env` if you want to use the AI assistant:

```env
NVIDIA_API_KEY=your_nvidia_nim_key
PORT=5000
```

`NVIDIA_API_KEY` is optional. The rest of the application works without it. Never commit API keys; `backend/.env` is ignored by Git.

## Run locally

Start the React frontend and Express API together:

```powershell
npm.cmd run dev
```

The frontend is normally available at `http://localhost:5173`, and the API runs at `http://localhost:5000`.

## Demo login

Use any seeded account with password `password`.

| Role | Email |
| --- | --- |
| Admin | `admin@assetflow.io` |
| Asset Manager | `priya@assetflow.io` |
| Department Head | `raj@assetflow.io` |
| Employee | `ananya@assetflow.io` |

New accounts are created through the signup form and stored in SQLite with bcrypt-hashed passwords.

## Persistence and API

The SQLite database is stored at `backend/assetflow.db`.

- UI data is loaded and saved through `GET` / `PUT` `/api/state`.
- Authentication uses `/api/auth/login` and `/api/auth/signup`.
- Entity APIs are available for users, assets, bookings, maintenance, transfers, audits, and notifications.
- The AI assistant endpoint is `POST /api/ai/chat`; it reads a live database summary before calling NVIDIA NIM.
- Check service availability at `GET /api/health`.

## Verify the project

```powershell
npm.cmd run lint
npm.cmd run build
```

To verify the backend independently:

```powershell
cd backend
npm.cmd run start
```

Then open `http://localhost:5000/api/health` in a browser.

## Project structure

```text
src/                 React application and API client
backend/models/      SQLite connection and schema
backend/routes/      Express API routes, including AI chat
backend/assetflow.db SQLite database (created after seeding/running)
```
