---
sidebar_position: 4
title: Running Cluster
---

# Running Cluster

Day-to-day operations for running Cluster in development and production.

## Development

### Start All Services

From the repository root:

```bash
pnpm dev
```

This runs concurrently:
- **API server** at http://localhost:4000 (with hot reload)
- **Web app** at http://localhost:3000 (with HMR)

### Start Individual Services

```bash
# API only
cd packages/server && pnpm dev

# Web only
cd packages/web && pnpm dev
```

### Database Operations

```bash
# Generate migrations from schema changes
cd packages/server
pnpm db:generate

# Apply pending migrations
pnpm db:migrate

# Open Drizzle Studio (database GUI)
pnpm db:studio
```

### Build for Production

```bash
# Build all packages
pnpm build

# Build individual package
cd packages/server && pnpm build
cd packages/web && pnpm build
```

## Production

### Docker Compose

```bash
# Start all services
docker compose up -d

# View logs
docker compose logs -f

# Stop all services
docker compose down

# Restart a service
docker compose restart api

# Rebuild after code changes
docker compose up -d --build
```

### Health Checks

```bash
# API health
curl http://localhost:4000/api/health

# Response
{
  "status": "ok",
  "timestamp": "2025-01-04T10:30:00.000Z",
  "service": "cluster-api"
}
```

### Database Migrations

```bash
# Docker Compose
docker compose exec api pnpm db:migrate

# Manual deployment
cd packages/server && NODE_ENV=production pnpm db:migrate
```

## Monitoring

### Logs

#### Docker

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f api

# Last 100 lines
docker compose logs --tail=100 api
```

#### Systemd (if using)

```bash
journalctl -u cluster-api -f
```

### Metrics

If `ENABLE_METRICS=true`, Prometheus metrics are exposed at `/metrics`:

```
# HELP http_request_duration_seconds HTTP request duration
# TYPE http_request_duration_seconds histogram
http_request_duration_seconds_bucket{method="GET",path="/api/annotations",le="0.1"} 150
http_request_duration_seconds_bucket{method="GET",path="/api/annotations",le="0.5"} 180
```

### Database Monitoring

```bash
# Connection count
psql -d cluster -c "SELECT count(*) FROM pg_stat_activity WHERE datname = 'cluster';"

# Table sizes
psql -d cluster -c "SELECT relname, pg_size_pretty(pg_total_relation_size(relid))
FROM pg_catalog.pg_statio_user_tables ORDER BY pg_total_relation_size(relid) DESC;"

# Slow queries (if pg_stat_statements enabled)
psql -d cluster -c "SELECT query, calls, mean_exec_time FROM pg_stat_statements
ORDER BY mean_exec_time DESC LIMIT 10;"
```

## Backups

### Database Backup

```bash
# Full backup
pg_dump -Fc cluster > backup-$(date +%Y%m%d).dump

# With Docker
docker compose exec postgres pg_dump -U cluster -Fc cluster > backup-$(date +%Y%m%d).dump
```

### Database Restore

```bash
# Restore from backup
pg_restore -d cluster backup-20250104.dump

# With Docker
cat backup-20250104.dump | docker compose exec -T postgres pg_restore -U cluster -d cluster
```

### Backup Schedule (cron)

```bash
# Daily backup at 2 AM
0 2 * * * pg_dump -Fc cluster > /backups/cluster-$(date +\%Y\%m\%d).dump
```

## Upgrades

### Docker Compose

```bash
# Pull latest images
docker compose pull

# Restart with new images
docker compose up -d

# Run any new migrations
docker compose exec api pnpm db:migrate
```

### Manual Deployment

```bash
# Pull latest code
git pull origin main

# Install dependencies
pnpm install

# Build packages
pnpm build

# Run migrations
cd packages/server && pnpm db:migrate && cd ../..

# Restart services
sudo systemctl restart cluster-api
```

## Troubleshooting

### API Won't Start

```bash
# Check logs
docker compose logs api

# Common issues:
# - DATABASE_URL incorrect
# - Azure AD credentials missing
# - Port already in use
```

### Database Connection Failed

```bash
# Test connection
psql $DATABASE_URL -c "SELECT 1;"

# Check PostgreSQL is running
docker compose ps postgres
# or
systemctl status postgresql
```

### Authentication Errors

```bash
# Verify Azure AD config
curl http://localhost:4000/api/health

# Check browser console for MSAL errors
# Common issues:
# - Redirect URI mismatch
# - Client ID/Tenant ID incorrect
# - Permissions not granted
```

### Out of Memory

```bash
# Check memory usage
docker stats

# Increase Node.js memory
NODE_OPTIONS="--max-old-space-size=4096" node dist/index.js
```

## Scaling

### Horizontal Scaling

To run multiple API instances:

1. Configure shared session storage (Redis)
2. Use a load balancer
3. Ensure database connection pooling

```yaml
# docker-compose.prod.yml
services:
  api:
    deploy:
      replicas: 3
    environment:
      REDIS_URL: redis://redis:6379
```

### Database Scaling

- Use read replicas for heavy read workloads
- Consider connection pooling (PgBouncer)
- Enable query caching for repeated queries

## Next Steps

- [Azure Setup](/authentication/azure-setup) — Configure authentication
- [API Reference](/api/overview) — Build integrations
