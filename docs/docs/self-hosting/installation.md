---
sidebar_position: 2
title: Installation
---

# Installation

This guide walks you through installing Cluster on your infrastructure.

## Option 1: Docker Compose (Recommended)

The fastest way to get Cluster running.

### Prerequisites

- Docker 24+
- Docker Compose 2.20+
- Azure AD app registration (see [Azure Setup](/authentication/azure-setup))

### Steps

#### 1. Clone the Repository

```bash
git clone https://github.com/cluster-research-solutions/cluster.git
cd cluster
```

#### 2. Create Environment File

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```bash
# Database
DB_PASSWORD=your-secure-password-here

# Azure AD (get from Azure Portal)
AZURE_TENANT_ID=your-tenant-id
AZURE_CLIENT_ID=your-client-id
AZURE_CLIENT_SECRET=your-client-secret

# Application URLs
API_URL=http://localhost:4000
WEB_URL=http://localhost:3000

# Session
SESSION_SECRET=$(openssl rand -base64 32)
```

#### 3. Start Services

```bash
docker compose up -d
```

This starts:
- PostgreSQL database
- Cluster API server
- Cluster web frontend

#### 4. Run Migrations

```bash
docker compose exec api pnpm db:migrate
```

#### 5. Access Cluster

Open http://localhost:3000 in your browser.

---

## Option 2: Manual Installation

For more control or when Docker isn't available.

### Prerequisites

- Node.js 20+
- pnpm 8+
- PostgreSQL 14+

### Steps

#### 1. Clone and Install Dependencies

```bash
git clone https://github.com/cluster-research-solutions/cluster.git
cd cluster
pnpm install
```

#### 2. Build Shared Package

```bash
cd packages/shared
pnpm build
cd ../..
```

#### 3. Configure PostgreSQL

Create the database:

```bash
createdb cluster
```

Or with psql:

```sql
CREATE DATABASE cluster;
```

#### 4. Configure Environment

Create `.env` in the root directory:

```bash
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/cluster

# Azure AD
AZURE_TENANT_ID=your-tenant-id
AZURE_CLIENT_ID=your-client-id
AZURE_CLIENT_SECRET=your-client-secret

# URLs
API_URL=http://localhost:4000
WEB_URL=http://localhost:3000

# Session
SESSION_SECRET=your-random-secret-here
```

Create `packages/web/.env`:

```bash
VITE_API_URL=http://localhost:4000/api
VITE_AZURE_CLIENT_ID=your-client-id
VITE_AZURE_TENANT_ID=your-tenant-id
```

#### 5. Run Migrations

```bash
cd packages/server
pnpm db:migrate
cd ../..
```

#### 6. Start Development Servers

```bash
pnpm dev
```

This starts:
- API server at http://localhost:4000
- Web app at http://localhost:3000

---

## Option 3: Production Build

For production deployments without Docker.

### Build All Packages

```bash
pnpm build
```

### Start Production Server

```bash
cd packages/server
NODE_ENV=production node dist/index.js
```

### Serve Frontend

The built frontend is static files in `packages/web/dist/`. Serve with:

- **Nginx** (recommended)
- **Caddy**
- **Any static file server**

Example Nginx configuration:

```nginx
server {
    listen 80;
    server_name cluster.yourcompany.com;

    # Frontend
    location / {
        root /var/www/cluster/packages/web/dist;
        try_files $uri $uri/ /index.html;
    }

    # API proxy
    location /api {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## Verify Installation

### Check API Health

```bash
curl http://localhost:4000/api/health
```

Expected response:

```json
{
  "status": "ok",
  "timestamp": "2025-01-04T10:30:00.000Z",
  "service": "cluster-api"
}
```

### Check Database

```bash
psql -d cluster -c "SELECT COUNT(*) FROM organizations;"
```

### Check Frontend

Open http://localhost:3000 — you should see the Cluster login page.

## Troubleshooting

### "Module not found: @cluster/shared"

Build the shared package:

```bash
cd packages/shared && pnpm build && cd ../..
```

### "Connection refused" database error

Ensure PostgreSQL is running:

```bash
# macOS
brew services start postgresql@15

# Linux
sudo systemctl start postgresql

# Docker
docker compose up -d postgres
```

### "AADSTS700016: Application not found"

Check Azure AD configuration:
- Verify `AZURE_CLIENT_ID` matches your app registration
- Ensure redirect URIs are configured correctly

### Port already in use

Find and kill the process:

```bash
lsof -i :3000  # or :4000
kill -9 <PID>
```

## Next Steps

- [Configuration](/self-hosting/configuration) — Customize settings
- [Running](/self-hosting/running) — Day-to-day operations
- [Azure Setup](/authentication/azure-setup) — Complete auth setup
