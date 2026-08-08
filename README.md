# Buildlog Backend

Buildlog Backend is the server-side API for a journaling and content creation assistant. It provides authenticated user management, work log tracking, quick capture storage, and AI-powered post generation for social platforms.

## What it is

This backend supports a product focused on helping creators, founders, developers, and learners document progress, generate social content, and stay consistent with their publishing workflow.

## Key features

- User authentication with email/password and Google login
- Password reset and secure session handling
- User profiles, onboarding state, and reminder settings
- Worklog creation, retrieval, and AI post generation
- Quick captures and draft post management
- Prisma ORM for PostgreSQL database access
- Middleware for security, request logging, error handling, and rate limiting

## Tech stack

- Node.js + TypeScript
- Express.js
- Prisma ORM
- PostgreSQL-compatible database
- OpenAI and Google generative AI clients
- JWT authentication
- Helmet, CORS, and rate limiting for security
- Zod for validation
- Winston and Morgan for logging

## Repository structure

- `src/app.ts` - application entry point
- `src/modules/auth` - authentication routes, controllers, validators
- `src/modules/user` - user profile and onboarding routes
- `src/modules/worklog` - worklog and post generation routes
- `src/middleware` - auth, error handling, rate limiting, async handling
- `src/generated/prisma` - Prisma client output
- `prisma/schema.prisma` - database schema and model definitions

## Getting started

1. Install dependencies:

```bash
npm install
```

2. Create environment variables.

You can follow the pattern in `env.ts` and provide values for:

- `PORT`
- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `OPENAI_API_KEY`
- any additional provider or notification keys used by the app

3. Generate Prisma client:

```bash
npx prisma generate
```

4. Start the development server:

```bash
npm run dev
```

5. Build for production:

```bash
npm run build
npm start
```

## API overview

- `GET /` - root health check
- `GET /health` - service status check
- `POST /api/auth/signup` - register new users
- `POST /api/auth/login` - sign in
- `POST /api/auth/google` - sign in with Google
- `POST /api/auth/password-reset/request` - request password reset
- `POST /api/auth/password-reset` - complete password reset
- `POST /api/auth/change-password` - change password (protected)
- `GET /api/user/profile` - get current user profile
- `PATCH /api/user/profile` - update profile
- `PATCH /api/user/profile/reminder` - update reminder settings
- `POST /api/user/onboarding` - complete onboarding
- `GET /api/worklog` - list worklogs (protected)
- `GET /api/worklog/today` - today's worklogs
- `GET /api/worklog/:id` - worklog details
- `POST /api/worklog` - create worklog
- `POST /api/worklog/:id/generate-posts` - generate social posts from worklog

## Notes

This project is designed as a backend service and expects a frontend or client app to consume its API. The Prisma schema currently targets a PostgreSQL-compatible datasource.


