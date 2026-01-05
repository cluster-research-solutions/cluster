---
sidebar_position: 3
title: Configuration
---

# Configuration

Cluster is configured through environment variables. This page documents all available options.

## Environment Variables

### Required Variables

#### Database

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/cluster` |

#### Azure AD

| Variable | Description | Example |
|----------|-------------|---------|
| `AZURE_TENANT_ID` | Azure AD directory ID | `12345678-1234-1234-1234-123456789012` |
| `AZURE_CLIENT_ID` | Application (client) ID | `87654321-4321-4321-4321-210987654321` |
| `AZURE_CLIENT_SECRET` | Client secret value | `abc123~secret` |

#### Application

| Variable | Description | Example |
|----------|-------------|---------|
| `SESSION_SECRET` | Secret for session cookies | `random-32-char-string` |

### Optional Variables

#### Server

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `4000` | API server port |
| `NODE_ENV` | `development` | Environment mode |
| `LOG_LEVEL` | `info` | Logging verbosity |

#### CORS

| Variable | Default | Description |
|----------|---------|-------------|
| `WEB_URL` | `http://localhost:3000` | Frontend origin for CORS |
| `CORS_CREDENTIALS` | `true` | Allow credentials in CORS |

#### Search (Optional)

| Variable | Default | Description |
|----------|---------|-------------|
| `MEILISEARCH_URL` | — | Meilisearch server URL |
| `MEILISEARCH_API_KEY` | — | Meilisearch API key |

#### Session (Optional)

| Variable | Default | Description |
|----------|---------|-------------|
| `REDIS_URL` | — | Redis URL for session storage |
| `SESSION_MAX_AGE` | `86400000` | Session TTL in milliseconds (24h) |

### Frontend Variables

These go in `packages/web/.env`:

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | API server URL | `http://localhost:4000/api` |
| `VITE_AZURE_CLIENT_ID` | Azure AD client ID | Same as `AZURE_CLIENT_ID` |
| `VITE_AZURE_TENANT_ID` | Azure AD tenant ID | Same as `AZURE_TENANT_ID` |

## Configuration Files

### .env.example

The repository includes an example configuration:

```bash
# Database
DATABASE_URL=postgresql://cluster:devpassword@localhost:5432/cluster

# Azure AD - Get these from Azure Portal
AZURE_TENANT_ID=your-tenant-id
AZURE_CLIENT_ID=your-client-id
AZURE_CLIENT_SECRET=your-client-secret

# Application
PORT=4000
NODE_ENV=development
WEB_URL=http://localhost:3000
SESSION_SECRET=change-this-to-a-random-string

# Optional: Meilisearch
# MEILISEARCH_URL=http://localhost:7700
# MEILISEARCH_API_KEY=your-master-key

# Optional: Redis (for multi-instance deployments)
# REDIS_URL=redis://localhost:6379
```

### Docker Compose Override

For local development, create `docker-compose.override.yml`:

```yaml
version: '3.8'
services:
  api:
    volumes:
      - ./packages/server/src:/app/packages/server/src
    environment:
      - LOG_LEVEL=debug
  web:
    volumes:
      - ./packages/web/src:/app/packages/web/src
```

## Production Configuration

### Security Recommendations

```bash
# Use strong secrets
SESSION_SECRET=$(openssl rand -base64 32)

# Enable production mode
NODE_ENV=production

# Use HTTPS URLs
WEB_URL=https://cluster.yourcompany.com
API_URL=https://api.cluster.yourcompany.com
```

### Database Connection

For production, use connection pooling:

```bash
# With PgBouncer
DATABASE_URL=postgresql://user:pass@pgbouncer:6432/cluster?pgbouncer=true

# AWS RDS with SSL
DATABASE_URL=postgresql://user:pass@rds-endpoint:5432/cluster?sslmode=require
```

### Multi-Instance Deployment

When running multiple API instances, configure shared session storage:

```bash
# Redis for sessions
REDIS_URL=redis://redis.cluster.internal:6379

# Or Redis Cluster
REDIS_URL=redis://node1:6379,node2:6379,node3:6379
```

## Logging

### Log Levels

| Level | Description |
|-------|-------------|
| `error` | Only errors |
| `warn` | Errors and warnings |
| `info` | Standard operations (default) |
| `debug` | Detailed debugging |

### Structured Logging

In production, logs are JSON-formatted:

```json
{
  "level": "info",
  "timestamp": "2025-01-04T10:30:00.000Z",
  "message": "Request completed",
  "method": "GET",
  "path": "/api/annotations",
  "status": 200,
  "duration": 45
}
```

## Feature Flags

Some features can be toggled via environment:

| Variable | Default | Description |
|----------|---------|-------------|
| `ENABLE_SEARCH` | `false` | Enable Meilisearch integration |
| `ENABLE_METRICS` | `false` | Expose Prometheus metrics |

## Validation

Cluster validates configuration on startup. Missing required variables will cause the server to exit with an error:

```
❌ Missing required environment variable: AZURE_CLIENT_ID
Please check your .env file or environment configuration.
```

## Next Steps

- [Running Cluster](/self-hosting/running) — Start and manage the application
- [Azure Setup](/authentication/azure-setup) — Configure authentication
