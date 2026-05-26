# AscendPath

AscendPath is a career-growth platform for discovering learning paths, building roadmaps, finding mentors, running sessions, tracking portfolio proof, and participating in a professional community. The repository contains a TypeScript/Express API and a React/Vite client.

## What It Does

- User authentication, profiles, roles, moderation, notifications, and admin workflows.
- Career taxonomy, pathway discovery, roadmap creation, and progress tracking.
- Mentor applications, mentorship relationships, session scheduling, reflections, reviews, and endorsements.
- Community features such as posts, replies, pings, search, recommendations, opportunities, and public growth showcases.
- Realtime updates through Socket.IO.

## Tech Stack

### Backend

- Node.js 20 and TypeScript
- Express 5
- MongoDB with Mongoose
- Zod for validation and environment parsing
- JWT, bcrypt, cookie-parser, helmet, CORS, and rate limiting
- Socket.IO for realtime behavior
- Winston for logging

### Frontend

- React 19 and TypeScript
- Vite
- React Router
- TanStack Query
- Axios
- Zustand
- React Hook Form and Zod
- Tailwind CSS, Radix UI, shadcn-style components, Lucide icons, and Framer Motion

## Project Structure

```text
.
|-- src/                 # Express API source
|   |-- app.ts           # Express app, middleware, and route registration
|   |-- server.ts        # MongoDB connection, HTTP server, Socket.IO bootstrap
|   |-- config/          # Environment loading and validation
|   |-- middleware/      # Auth, RBAC, rate limiting, errors, request context
|   |-- modules/         # Feature modules: routes, controllers, services, repos, models
|   `-- utils/           # Shared backend utilities
|-- client/              # React/Vite frontend
|   |-- src/app/         # Client router
|   |-- src/components/  # Shared UI, layout, route guards, providers
|   |-- src/features/    # Feature-specific API clients, hooks, components, types
|   |-- src/pages/       # Route-level pages
|   |-- src/services/    # Shared API client
|   `-- src/store/       # Client state
|-- scripts/             # Data seeding and maintenance scripts
|-- docs/                # Architecture and operations notes
`-- dist/                # Generated backend build output, ignored by git
```

## Getting Started

### Prerequisites

- Node.js 20.x
- npm 10+
- A MongoDB connection string

### Backend

```bash
npm install
cp .env.example .env
npm run dev
```

Fill `.env` with at least:

```env
MONGODB_URI=mongodb+srv://...
JWT_SECRET=replace-with-at-least-32-characters
CLIENT_URL=http://localhost:5173
PORT=5000
```

The API health check is available at:

```text
http://localhost:5000/health
```

### Frontend

```bash
cd client
npm install
cp .env.example .env
npm run dev
```

The Vite dev server usually runs at:

```text
http://localhost:5173
```

## Common Commands

### Backend

```bash
npm run dev        # Start the API with nodemon and ts-node
npm run build      # Compile TypeScript into dist/
npm start          # Run the compiled API from dist/
npm run seed:all   # Seed the full demo dataset
```

### Frontend

```bash
cd client
npm run dev        # Start the Vite dev server
npm run build      # Type-check and build the client
npm run lint       # Run ESLint
npm run preview    # Preview the production client build
```

## Architecture Overview

The backend is organized as feature modules under `src/modules`. Each module owns the route layer, request validation, controller actions, service logic, repository access, and Mongoose models for its domain. `src/app.ts` wires global middleware and mounts versioned routes under `/api/v1`, while `src/server.ts` owns process startup, MongoDB connection handling, HTTP server creation, Socket.IO initialization, and graceful shutdown.

The frontend follows a feature-oriented layout under `client/src/features`, with shared shell components in `client/src/components`, route-level screens in `client/src/pages`, and API access centralized through `client/src/services/apiClient.ts`. TanStack Query handles server state, Zustand stores client auth state, and React Router defines protected, admin, and public routes.

Generated dependencies and build outputs are intentionally ignored. Recreate them with `npm install` and `npm run build` instead of committing `node_modules/`, `dist/`, or client build directories.
