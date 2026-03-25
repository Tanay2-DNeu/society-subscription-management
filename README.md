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


## Author

Tanay Singh
