---
sidebar_position: 4
title: Hosting Options
---

# Hosting Options

Cluster can be deployed in several ways depending on your infrastructure requirements and preferences.

## Self-Hosted (Recommended)

Deploy Cluster on your own infrastructure for complete control over your data.

### Docker Compose

The simplest self-hosted option. Runs all services on a single machine.

```yaml
# docker-compose.yml
services:
  postgres:
    image: postgres:15-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      POSTGRES_DB: cluster
      POSTGRES_USER: cluster
      POSTGRES_PASSWORD: ${DB_PASSWORD}

  api:
    image: ghcr.io/cluster-research-solutions/cluster-api:latest
    environment:
      DATABASE_URL: postgresql://cluster:${DB_PASSWORD}@postgres:5432/cluster
      AZURE_TENANT_ID: ${AZURE_TENANT_ID}
      AZURE_CLIENT_ID: ${AZURE_CLIENT_ID}
      AZURE_CLIENT_SECRET: ${AZURE_CLIENT_SECRET}
    ports:
      - "4000:4000"

  web:
    image: ghcr.io/cluster-research-solutions/cluster-web:latest
    environment:
      VITE_API_URL: https://api.your-domain.com
      VITE_AZURE_CLIENT_ID: ${AZURE_CLIENT_ID}
      VITE_AZURE_TENANT_ID: ${AZURE_TENANT_ID}
    ports:
      - "3000:3000"
```

**Best for:** Small teams, development, proof-of-concept

### Kubernetes

For production deployments with high availability requirements.

```yaml
# Example deployment (simplified)
apiVersion: apps/v1
kind: Deployment
metadata:
  name: cluster-api
spec:
  replicas: 3
  template:
    spec:
      containers:
        - name: api
          image: ghcr.io/cluster-research-solutions/cluster-api:latest
          envFrom:
            - secretRef:
                name: cluster-secrets
```

**Best for:** Enterprise, high availability, auto-scaling

### Cloud VMs

Deploy on any cloud provider's virtual machines:

- **AWS EC2** with RDS for PostgreSQL
- **Azure VMs** with Azure Database for PostgreSQL
- **GCP Compute Engine** with Cloud SQL
- **DigitalOcean Droplets** with Managed Databases

**Best for:** Teams with existing cloud infrastructure

## Infrastructure Requirements

### Minimum (Development)

| Resource | Requirement |
|----------|-------------|
| CPU | 2 cores |
| RAM | 4 GB |
| Storage | 20 GB SSD |
| Database | PostgreSQL 14+ |

### Recommended (Production)

| Resource | Requirement |
|----------|-------------|
| CPU | 4+ cores |
| RAM | 8+ GB |
| Storage | 100 GB SSD |
| Database | PostgreSQL 15 (managed recommended) |

### Network Requirements

| Port | Service | Notes |
|------|---------|-------|
| 443 | HTTPS | Web application and API |
| 5432 | PostgreSQL | Can be internal only |

## Comparison

| Aspect | Self-Hosted | Managed SaaS (Future) |
|--------|-------------|----------------------|
| **Data Location** | Your infrastructure | Cluster-managed cloud |
| **Setup Time** | 1-2 hours | Minutes |
| **Maintenance** | You manage updates | Automatic |
| **Cost** | Infrastructure only | Subscription |
| **Compliance** | Full control | Shared responsibility |
| **Customization** | Full access | Limited |

## External Dependencies

Regardless of hosting option, Cluster requires:

### Required
- **Azure AD** or **Google OAuth** — User authentication
- **SharePoint** or **Google Drive** — File storage (your existing cloud)
- **PostgreSQL 14+** — Annotation storage

### Optional
- **Meilisearch** — Full-text search (recommended for production)
- **Redis** — Session caching (recommended for multi-instance)
- **S3-compatible storage** — For exports and backups

## Data Residency

Cluster stores only:
- User profiles (synced from Azure AD/Google)
- Annotations (W3C JSON-LD format)
- Clusters and insights
- File references (not the files themselves)

**Your source files never leave your cloud storage.** Cluster accesses them via Microsoft Graph API or Google Drive API using delegated user permissions.

## Next Steps

- [System Requirements](/self-hosting/requirements) — Detailed prerequisites
- [Installation Guide](/self-hosting/installation) — Step-by-step setup
- [Azure AD Setup](/authentication/azure-setup) — Configure authentication
