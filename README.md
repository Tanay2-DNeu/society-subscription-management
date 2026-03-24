# Society Subscription Management

A full-stack web app for managing residential society flats, residents, subscriptions, monthly billing records, and payment tracking.

## Overview

This project is split into two apps:

- `client`: Next.js frontend for admin and resident workflows
- `server`: Express.js backend with PostgreSQL

Core modules in the project include:

- Resident registration and login
- Admin dashboard
- Flats management and resident assignment
- Subscription plan management
- Monthly records generation
- Payment entry and due tracking
- Notifications and reports

## Tech Stack

- Frontend: Next.js, React, TypeScript, Tailwind CSS, Axios
- Backend: Node.js, Express.js, PostgreSQL
- Auth: JWT, cookies, Google OAuth support

## Project Structure

```text
society-subscription-management/
├── client/
├── server/
├── docs/
└── README.md
```

## Getting Started

### 1. Clone the project

```bash
git clone <your-repo-url>
cd society-subscription-management
```

### 2. Install dependencies

Client:

```bash
cd client
npm install
```

Server:

```bash
cd server
npm install
```

## Environment Variables

### Client

Create `client/.env.local`:

```env
NEXT_PUBLIC_BACKEND_URL="http://localhost:8000"
```

### Server

Create `server/.env`:

```env
PORT=8000
DATABASE_URL=postgres://postgres:postgres123@localhost:5432/society_subscription
JWT_SECRET=supersecret
```

Adjust these values for your local environment.

## Run Locally

Start the backend:

```bash
cd server
npm run dev
```

Start the frontend:

```bash
cd client
npm run dev
```

App URLs:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000`

## Documentation

Additional module notes and project docs are available in [`docs/`](/home/tanay-singh/Webdev/Project/society-subscription-management/docs).

Useful files:

- [`docs/PROJECT_CONTEXT.md`](/home/tanay-singh/Webdev/Project/society-subscription-management/docs/PROJECT_CONTEXT.md)
- [`docs/API_CONTRACT.md`](/home/tanay-singh/Webdev/Project/society-subscription-management/docs/API_CONTRACT.md)
- [`docs/DB_SCHEMA.md`](/home/tanay-singh/Webdev/Project/society-subscription-management/docs/DB_SCHEMA.md)

## Screenshots

Add your screenshots below by replacing the placeholders.

### Landing / Login

![Add screenshot here](./docs/screenshots/landing-or-login.png)

### Admin Dashboard

![Add screenshot here](./docs/screenshots/admin-dashboard.png)

### Flats Management

![Add screenshot here](./docs/screenshots/flats-management.png)

### Monthly Records

![Add screenshot here](./docs/screenshots/monthly-records.png)

### Resident Dashboard

![Add screenshot here](./docs/screenshots/resident-dashboard.png)

## Future Improvements

- Add automated tests
- Improve role-based access handling
- Add deployment instructions
- Add screenshot assets and demo GIFs

## Author

Tanay Singh
