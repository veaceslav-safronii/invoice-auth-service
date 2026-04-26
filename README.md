# invoice-auth-service

Authentication and authorization microservice for the Invoice System project (IDP – UPB 342C5).

## Endpoints

| Method | Path | Description | Auth required |
|--------|------|-------------|---------------|
| POST | /auth/register | Register a new user | No |
| POST | /auth/login | Login and receive JWT token | No |
| POST | /auth/validate | Validate a JWT token | No |
| GET | /auth/health | Health check | No |

## Example requests

**Register:**
```bash
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"john","email":"john@example.com","password":"secret123"}'
```

**Login:**
```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"secret123"}'
```

## Environment variables

Copy `.env.example` to `.env` and fill in the values:

```
PORT=3001
DB_HOST=postgres
DB_NAME=invoices_db
DB_USER=invoice_user
DB_PASSWORD=invoice_pass
JWT_SECRET=your-secret-key-here
```

## Run locally

```bash
npm install
cp .env.example .env
node src/index.js
```

## Tech stack

- Node.js + Express.js
- PostgreSQL (schema: `auth_schema`)
- bcryptjs (password hashing)
- jsonwebtoken (JWT)
