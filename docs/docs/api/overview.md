---
sidebar_position: 1
title: API Overview
---

# API Overview

Cluster provides a RESTful API for all operations. The API follows W3C Web Annotation standards for annotation data.

## Base URL

```
# Development
http://localhost:4000/api

# Production
https://your-domain.com/api
```

## Authentication

All API requests require a valid Azure AD access token:

```http
Authorization: Bearer <access-token>
```

See [Authentication](/api/authentication) for details.

## Response Format

### Success Response

```json
{
  "data": { ... },
  "meta": {
    "timestamp": "2025-01-03T14:30:00Z"
  }
}
```

### Collection Response

```json
{
  "data": [ ... ],
  "meta": {
    "total": 100,
    "offset": 0,
    "limit": 20
  }
}
```

### Error Response

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid selector type",
    "details": {
      "field": "target.selector.type",
      "received": "InvalidSelector"
    }
  }
}
```

## HTTP Status Codes

| Code | Description |
|------|-------------|
| `200` | Success |
| `201` | Created |
| `204` | No Content (successful deletion) |
| `400` | Bad Request (validation error) |
| `401` | Unauthorized (missing/invalid token) |
| `403` | Forbidden (insufficient permissions) |
| `404` | Not Found |
| `422` | Unprocessable Entity (semantic error) |
| `500` | Internal Server Error |

## Content Types

### Request

```http
Content-Type: application/json
```

For W3C annotation operations:

```http
Content-Type: application/ld+json; profile="http://www.w3.org/ns/anno.jsonld"
```

### Response

Standard responses use JSON:

```http
Content-Type: application/json
```

W3C annotation responses use JSON-LD:

```http
Content-Type: application/ld+json; profile="http://www.w3.org/ns/anno.jsonld"
```

## API Sections

### Core Resources

| Endpoint | Description |
|----------|-------------|
| `/api/annotations` | W3C Web Annotations |
| `/api/clusters` | Annotation collections (affinity groups) |
| `/api/studies` | Research studies/projects |
| `/api/files` | SharePoint file proxy |
| `/api/tags` | Tag taxonomies |
| `/api/insights` | Research insights |

### Authentication

| Endpoint | Description |
|----------|-------------|
| `/api/auth/me` | Current user info |
| `/api/auth/organization` | Current organization |

## Rate Limiting

Cluster does not impose rate limits by default. Self-hosted deployments can configure rate limiting via reverse proxy (nginx, Traefik).

## Pagination

Collection endpoints support pagination:

```http
GET /api/annotations?offset=20&limit=10
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `offset` | integer | 0 | Skip this many results |
| `limit` | integer | 20 | Maximum results to return |

## Filtering

Most collection endpoints support filtering:

```http
GET /api/annotations?studyId=uuid&motivation=highlighting
```

## Sorting

Use `sortBy` and `sortOrder` parameters:

```http
GET /api/annotations?sortBy=created&sortOrder=desc
```

## CORS

The API allows cross-origin requests from configured origins:

```typescript
// Default development
cors({ origin: 'http://localhost:3000' })

// Production - configure in environment
cors({ origin: process.env.WEB_URL })
```

## Versioning

The API is currently unversioned. Breaking changes will be communicated via changelog and migration guides.

## OpenAPI Specification

An OpenAPI 3.0 specification is available at:

```
GET /api/openapi.json
```

## Next Steps

- [Authentication](/api/authentication) — Token management
- [Annotations](/api/annotations) — W3C annotation operations
- [W3C Export](/api/w3c-export) — Standards-compliant data export
