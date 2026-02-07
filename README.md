# Serfix – Services Management API

Production-ready backend API for managing services. Users authenticate to access available services; only authorized administrators can create, update, or delete services.

## Tech stack

- **Node.js** 18+ with **Express**
- **PostgreSQL** with **Prisma** ORM
- **JWT** authentication, **bcrypt** password hashing
- **Swagger** (OpenAPI 3) at `/api-docs`

## Prerequisites

- Node.js 18 or later
- PostgreSQL (local or Docker)
- npm or pnpm

## Steps to run the API

1. **Clone the repository**
   ```bash
   git clone git@github.com:abdallhsamy/serfix.git
   cd serfix
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment**
   - Copy `.env.example` to `.env`
   - Set at least:
      - `DATABASE_URL` – PostgreSQL connection string (e.g. `postgresql://user:password@localhost:5432/serfix?schema=public`)
      - `JWT_SECRET` – at least 32 characters

   ```bash
   cp .env.example .env
   # Edit .env with your DATABASE_URL and JWT_SECRET
   ```

4. **Start PostgreSQL** (if not already running)
   - Local: ensure Postgres is running on the host/port used in `DATABASE_URL`
   - Docker example:
     ```bash
     docker run -d --name serfix-db -e POSTGRES_USER=user -e POSTGRES_PASSWORD=password -e POSTGRES_DB=serfix -p 5432:5432 postgres:16-alpine
     ```

5. **Run migrations**
   ```bash
   npx prisma migrate deploy
   ```
   For first-time dev you can use:
   ```bash
   npx prisma migrate dev
   ```

6. **Seed the database (optional)**
   - Creates an admin user and sample services.
   - Admin: `admin@example.com` / `User123!`
   ```bash
   npx prisma db seed
   ```

7. **Start the server**
   - Development:
     ```bash
     npm run dev
     ```
   - Production:
     ```bash
     npm run build
     npm start
     ```

The API will be available at `http://localhost:3000` (or the `PORT` in `.env`).

## Run with Docker

All configuration is read from `.env`; no values are hardcoded in the Compose file.

1. **Copy env and set variables**
   ```bash
   cp .env.example .env
   # Edit .env: set POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB, JWT_SECRET (min 32 chars), and optionally PORT, CORS_ORIGINS, etc.
   ```

2. **Build and start**
   ```bash
   docker compose up -d --build
   ```

3. **Optional: seed the database**
   ```bash
   docker compose exec app npx prisma db seed
   ```

4. **Stop**
   ```bash
   docker compose down
   ```

- **PostgreSQL** runs as a separate service; `DATABASE_URL` for the app is built from `POSTGRES_*` and the `postgres` hostname inside the network.
- **App** runs migrations on startup, then listens on `PORT` (default 3000). API: `http://localhost:3000` (or your `PORT`). Swagger: `http://localhost:3000/api-docs`.

## API documentation (Swagger)

- Open **Swagger UI**: [http://localhost:3000/api-docs](http://localhost:3000/api-docs)
- **Authorize**: use **Authorize** in Swagger UI and enter the JWT access token as `Bearer <token>` (from login or register response).

## Authentication

1. **Register** – `POST /api/v1/auth/register` with `email`, `password`, `name`. Password must be at least 8 characters with uppercase, lowercase, and a number.
2. **Login** – `POST /api/v1/auth/login` with `email`, `password`. Response includes `accessToken` and `expiresIn`.
3. Use the token in the `Authorization` header for protected routes: `Authorization: Bearer <accessToken>`.

## Endpoints

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| POST | `/api/v1/auth/register` | No | - | Register new user |
| POST | `/api/v1/auth/login` | No | - | Login |
| GET | `/api/v1/services` | Yes | User/Admin | List services (paginated, optional `?isActive=`) |
| GET | `/api/v1/services/:id` | Yes | User/Admin | Get one service |
| POST | `/api/v1/services` | Yes | Admin | Create service |
| PATCH | `/api/v1/services/:id` | Yes | Admin | Update service |
| DELETE | `/api/v1/services/:id` | Yes | Admin | Delete service |
| GET | `/health` | No | - | Liveness |
| GET | `/ready` | No | - | Readiness (checks DB) |

## Testing

Tests use Jest and Supertest. Integration tests require a test database.

1. **Create a test database** (e.g. `serfix_test`) and run migrations:
   ```bash
   # Point DATABASE_URL to serfix_test, then:
   npx prisma migrate deploy
   ```

2. **Optional:** Copy `.env.test.example` to `.env.test` and set `DATABASE_URL` and `JWT_SECRET`. If omitted, the setup falls back to `.env` or defaults.

3. **Run tests**
   ```bash
   npm test
   ```

4. **Coverage**
   ```bash
   npm test -- --coverage
   ```

5. **Results**
   ```bash
   Test Suites: 6 passed, 6 total
   Tests:       45 passed, 45 total
   Snapshots:   0 total
   Time:        2.16 s, estimated 3 s
   Ran all test suites.
   ```

## Screenshots
![1](/screenshots/1.jpg)
![2](/screenshots/2.jpg)
![3](/screenshots/3.jpg)
![4](/screenshots/4.jpg)
![5](/screenshots/5.jpg)
![6](/screenshots/6.jpg)
![7](/screenshots/7.jpg)
![8](/screenshots/8.jpg)


- GitHub: [https://github.com/abdallhsamy/serfix](https://github.com/abdallhsamy/serfix)

## License

MIT


