# URL Shortener

# Architecture overview
[Architecture](/docs/architecture.md)

# TODOs
[TODO List](/TODO.md)

## Сервіси

- **auth-service** — порт 3001
- **shortener-service** — порт 3002
- **audit-log-service** — порт 3003

# Local development setup

## 1. Start PostgreSQL
```bash
docker compose -f dc-psql-dev.yml up -d
```

## 2. Start backend services
```bash
docker compose -f dc-backend-dev.yml up -d
```

## 3. Run migrations (first time only)
```bash
docker compose -f dc-backend-dev.yml exec auth-service npx prisma migrate dev
```

## Database access

| Host | Port | User | Password |
|------|------|------|----------|
| localhost | 3500 | postgres | postgres |

Connection strings:
```
postgresql://postgres:postgres@localhost:3500/auth_service
postgresql://postgres:postgres@localhost:3500/shortener_service
postgresql://postgres:postgres@localhost:3500/audit_log_service
```

## Stop services
```bash
docker compose -f dc-backend-dev.yml down
docker compose -f dc-psql-dev.yml down
```

## Reset database (removes all data)
```bash
docker compose -f dc-psql-dev.yml down -v
```
