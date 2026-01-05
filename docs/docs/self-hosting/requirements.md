---
sidebar_position: 1
title: System Requirements
---

# System Requirements

Before installing Cluster, ensure your environment meets these requirements.

## Hardware Requirements

### Minimum (Development / Small Team)

| Resource | Requirement |
|----------|-------------|
| **CPU** | 2 cores |
| **RAM** | 4 GB |
| **Storage** | 20 GB SSD |
| **Network** | 100 Mbps |

### Recommended (Production)

| Resource | Requirement |
|----------|-------------|
| **CPU** | 4+ cores |
| **RAM** | 8+ GB |
| **Storage** | 100+ GB SSD |
| **Network** | 1 Gbps |

:::tip Storage Note
Cluster stores only annotations and metadata, not media files. Storage requirements scale with annotation volume, not file size.
:::

## Software Requirements

### Required

| Software | Version | Notes |
|----------|---------|-------|
| **Node.js** | 20 LTS or higher | Runtime for API server |
| **PostgreSQL** | 14 or higher | 15+ recommended |
| **pnpm** | 8 or higher | Package manager |

### Optional

| Software | Version | Purpose |
|----------|---------|---------|
| **Docker** | 24+ | Container deployment |
| **Docker Compose** | 2.20+ | Multi-container orchestration |
| **Meilisearch** | 1.5+ | Full-text search |
| **Redis** | 7+ | Session storage (multi-instance) |

## Cloud Requirements

### Microsoft 365 / Azure AD

Cluster requires Azure AD for authentication. You need:

- **Azure AD tenant** (included with Microsoft 365)
- **Admin access** to register applications
- **SharePoint** site with research files

Required Azure AD permissions:

| Permission | Type | Purpose |
|------------|------|---------|
| `User.Read` | Delegated | Read user profile |
| `Files.Read.All` | Delegated | Access SharePoint files |
| `Sites.Read.All` | Delegated | List SharePoint sites |

### Google Workspace (Coming Soon)

Future releases will support Google Drive:

- Google Workspace account
- OAuth 2.0 application credentials
- Drive API enabled

## Network Requirements

### Inbound Ports

| Port | Protocol | Service |
|------|----------|---------|
| 443 | HTTPS | Web application and API |

### Outbound Connections

Cluster needs to reach:

| Destination | Purpose |
|-------------|---------|
| `login.microsoftonline.com` | Azure AD authentication |
| `graph.microsoft.com` | Microsoft Graph API |
| `*.sharepoint.com` | SharePoint file access |

### CORS Configuration

The API server must allow requests from your web frontend origin:

```typescript
// Default development
cors({ origin: 'http://localhost:3000' })

// Production
cors({ origin: 'https://cluster.yourcompany.com' })
```

## Database Requirements

### PostgreSQL

Cluster requires PostgreSQL 14+ with:

- **UUID extension** (`uuid-ossp` or use `gen_random_uuid()`)
- **JSONB support** (native in PG 9.4+)
- **UTF-8 encoding**

Recommended PostgreSQL settings:

```ini
# postgresql.conf
shared_buffers = 256MB          # 25% of RAM for small instances
effective_cache_size = 768MB    # 75% of RAM
work_mem = 16MB
maintenance_work_mem = 128MB
```

### Connection Pooling

For production, use connection pooling:

- **PgBouncer** — Lightweight, battle-tested
- **Managed pools** — AWS RDS Proxy, Azure connection pooling

## Browser Support

Cluster's web interface supports:

| Browser | Minimum Version |
|---------|----------------|
| Chrome | 90+ |
| Firefox | 90+ |
| Safari | 14+ |
| Edge | 90+ |

:::caution Internet Explorer
Internet Explorer is not supported.
:::

## Verification Commands

### Check Node.js

```bash
node --version
# Expected: v20.x.x or higher
```

### Check pnpm

```bash
pnpm --version
# Expected: 8.x.x or higher
```

### Check PostgreSQL

```bash
psql --version
# Expected: psql (PostgreSQL) 14.x or higher
```

### Check Docker (optional)

```bash
docker --version
# Expected: Docker version 24.x.x or higher

docker compose version
# Expected: Docker Compose version v2.20.x or higher
```

## Next Steps

Once requirements are met:

1. [Installation Guide](/self-hosting/installation) — Set up Cluster
2. [Azure AD Setup](/authentication/azure-setup) — Configure authentication
