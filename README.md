# AssetFlow

AssetFlow is a React and Vite asset-management dashboard backed by an Express API and SQLite. It supports organization records, assets, allocation and transfers, bookings, maintenance, audits, notifications, activity logs, and user accounts.

## Requirements

- Node.js 18 or newer
- npm

## Setup

Install the frontend dependencies:

```powershell
npm.cmd install
```

Install the backend dependencies and create the SQLite schema plus sample data:

```powershell
cd backend
npm.cmd install
npm.cmd run seed
cd ..
```

## Run the project

Start the frontend and API together (this is required for login and signup):

```powershell
npm.cmd run dev:full
```

`npm.cmd run dev` starts the same two services.

Open the Vite URL shown in the terminal (normally `http://localhost:5173`). The API runs on `http://localhost:5000`.

## Demo account

Use one of the listed demo users, then press **Log in**:

- Email: `admin@assetflow.io`
- Password: `password`

The other seeded accounts use the same password.

## Data persistence

SQLite data is stored in `backend/assetflow.db`.

- Core entity routes are available under `/api` (`assets`, `users`, `bookings`, `maintenance`, `transfers`, `audits`, and `notifications`).
- The React dashboard persists its complete UI data model through `GET` and `PUT /api/state`, so all screen changes remain after a refresh or backend restart.
- New user accounts are created through `/api/auth/signup` and are stored in the `users` table with a hashed password.

## Test commands

```powershell
npm.cmd run lint
npm.cmd run build
cd backend
npm.cmd run seed
```

To verify the API after starting it, visit `http://localhost:5000/api/health`.

## Project structure

```text
src/                 React UI and API client
backend/routes/      Express endpoints
backend/models/      SQLite schema and connection helper
backend/assetflow.db SQLite database file
```
