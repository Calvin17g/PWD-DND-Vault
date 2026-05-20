# D&D Character Vault — Backend

Express + Prisma + PostgreSQL API for the D&D Character Sheet application.

## Tech Stack

| Library          | Purpose                                   |
| ---------------- | ----------------------------------------- |
| `express`        | HTTP server and routing                   |
| `prisma`         | ORM for database access                   |
| `@prisma/client` | Auto-generated type-safe DB client        |
| `bcryptjs`       | Password hashing                          |
| `jsonwebtoken`   | JWT auth tokens                           |
| `cors`           | Allow cross-origin requests from frontend |
| `nodemon`        | Auto-restart server during development    |

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

```env
DATABASE_URL="postgresql://username:password@localhost:5432/dnd_app"
JWT_SECRET="your_super_secret_jwt_key_here"
PORT=8000
```

### 3. Set up the database

Make sure PostgreSQL is running, then run Prisma migrations:

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 4. Start the development server

```bash
npm run dev
```

Server will run at `http://localhost:8000`

## API Routes

### Auth

| Method | Route            | Description          |
| ------ | ---------------- | -------------------- |
| POST   | `/auth/register` | Create a new account |
| POST   | `/auth/login`    | Login, returns JWT   |

### Characters (all require Bearer token)

| Method | Route                   | Description                           |
| ------ | ----------------------- | ------------------------------------- |
| GET    | `/characters`           | Get all characters for logged-in user |
| GET    | `/characters/:id`       | Get one character                     |
| POST   | `/characters`           | Create a character                    |
| PUT    | `/characters/:id`       | Full update of a character            |
| PATCH  | `/characters/:id/stats` | Quick stat update (HP, death saves)   |
| DELETE | `/characters/:id`       | Delete a character                    |

## Required Environment Variables

| Variable       | Description                               |
| -------------- | ----------------------------------------- |
| `DATABASE_URL` | PostgreSQL connection string              |
| `JWT_SECRET`   | Secret key for signing JWTs               |
| `PORT`         | Port to run the server on (default: 8000) |
