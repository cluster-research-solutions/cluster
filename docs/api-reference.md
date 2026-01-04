# API Reference

Base URL: `http://localhost:4000/api` (development)

All endpoints except `/health` require authentication via Bearer token in the `Authorization` header.

## Authentication

### Get Auth Status
```http
GET /auth/status
Authorization: Bearer {access_token}
```

**Response:**
```json
{
  "authenticated": true,
  "user": {
    "id": "uuid",
    "orgId": "uuid",
    "email": "user@example.com",
    "displayName": "User Name"
  },
  "org": {
    "id": "uuid",
    "name": "Organization Name",
    "azureTenantId": "tenant-id"
  }
}
```

### Get User Profile
```http
GET /auth/me
Authorization: Bearer {access_token}
```

Returns the full Microsoft Graph user profile.

### Logout
```http
POST /auth/logout
```

Server-side logout (client handles MSAL logout).

## Health

### Check API Health
```http
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-01-03T14:30:00.000Z",
  "service": "research-annotations-api"
}
```

## SharePoint Files

All file endpoints require authentication.

### List Sites
```http
GET /files/sites
Authorization: Bearer {access_token}
```

**Response:**
```json
[
  {
    "id": "site-id",
    "displayName": "Site Name",
    "webUrl": "https://tenant.sharepoint.com/sites/sitename",
    "description": "Site description"
  }
]
```

### Get Site
```http
GET /files/sites/:siteId
Authorization: Bearer {access_token}
```

### List Drives
```http
GET /files/sites/:siteId/drives
Authorization: Bearer {access_token}
```

**Response:**
```json
[
  {
    "id": "drive-id",
    "name": "Documents",
    "description": "Document library",
    "driveType": "documentLibrary",
    "webUrl": "https://..."
  }
]
```

### List Drive Items
```http
GET /files/drives/:driveId/items?itemId=root
Authorization: Bearer {access_token}
```

**Query Parameters:**
- `itemId` (optional): ID of folder to list. Defaults to `root`.

**Response:**
```json
[
  {
    "id": "item-id",
    "name": "file.mp4",
    "size": 12345678,
    "webUrl": "https://...",
    "createdDateTime": "2025-01-01T00:00:00Z",
    "lastModifiedDateTime": "2025-01-02T00:00:00Z",
    "file": {
      "mimeType": "video/mp4",
      "hashes": {
        "quickXorHash": "..."
      }
    }
  }
]
```

### Get Item
```http
GET /files/drives/:driveId/items/:itemId
Authorization: Bearer {access_token}
```

### Stream File Content
```http
GET /files/drives/:driveId/items/:itemId/content
Authorization: Bearer {access_token}
```

Returns the file as a stream.

### Get Download URL
```http
GET /files/drives/:driveId/items/:itemId/download-url
Authorization: Bearer {access_token}
```

**Response:**
```json
{
  "url": "https://..."
}
```

Temporary download URL (expires after a few minutes).

## Annotations (Coming Soon)

### List Annotations
```http
GET /annotations
Authorization: Bearer {access_token}
```

### Create Annotation
```http
POST /annotations
Authorization: Bearer {access_token}
Content-Type: application/json
```

### Get Annotation
```http
GET /annotations/:id
Authorization: Bearer {access_token}
```

### Update Annotation
```http
PUT /annotations/:id
Authorization: Bearer {access_token}
Content-Type: application/json
```

### Delete Annotation
```http
DELETE /annotations/:id
Authorization: Bearer {access_token}
```

## Studies (Coming Soon)

### List Studies
```http
GET /studies
Authorization: Bearer {access_token}
```

### Create Study
```http
POST /studies
Authorization: Bearer {access_token}
Content-Type: application/json
```

### Get Study
```http
GET /studies/:id
Authorization: Bearer {access_token}
```

### Update Study
```http
PUT /studies/:id
Authorization: Bearer {access_token}
Content-Type: application/json
```

### Delete Study
```http
DELETE /studies/:id
Authorization: Bearer {access_token}
```

## Error Responses

All endpoints may return these error responses:

### 401 Unauthorized
```json
{
  "error": "No authorization token provided"
}
```

### 500 Internal Server Error
```json
{
  "error": "Error message"
}
```

## Rate Limiting

Currently no rate limiting is implemented. This will be added in production.

## CORS

CORS is configured to allow requests from `http://localhost:3000` in development.

## Content Types

- Request bodies should be `application/json`
- File streams use the original file's MIME type
- All JSON responses use `application/json`
