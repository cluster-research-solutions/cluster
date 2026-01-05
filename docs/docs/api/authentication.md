---
sidebar_position: 2
title: Authentication
---

# API Authentication

Cluster uses Azure AD OAuth 2.0 tokens for API authentication. The frontend handles token acquisition; the API validates tokens on each request.

## Token Flow

```mermaid
sequenceDiagram
    participant Client
    participant API
    participant AzureAD

    Client->>AzureAD: Acquire token (MSAL)
    AzureAD->>Client: Access token + ID token
    Client->>API: Request + Bearer token
    API->>AzureAD: Validate token
    AzureAD->>API: Token valid + claims
    API->>Client: Response
```

## Request Format

Include the access token in the `Authorization` header:

```http
GET /api/annotations HTTP/1.1
Host: localhost:4000
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJS...
```

## Token Validation

The API validates:

1. **Signature** — Token signed by Azure AD
2. **Issuer** — Matches configured tenant
3. **Audience** — Matches application ID
4. **Expiration** — Token not expired
5. **Tenant** — Matches allowed tenant(s)

## Current User

### Get Current User

```http
GET /api/auth/me
```

**Response:**

```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "jsmith@company.com",
    "displayName": "Jane Smith",
    "avatarUrl": "https://graph.microsoft.com/v1.0/me/photo/$value",
    "organization": {
      "id": "660e8400-e29b-41d4-a716-446655440000",
      "name": "Company Inc",
      "azureTenantId": "12345678-1234-1234-1234-123456789012"
    }
  }
}
```

### Get Current Organization

```http
GET /api/auth/organization
```

**Response:**

```json
{
  "data": {
    "id": "660e8400-e29b-41d4-a716-446655440000",
    "name": "Company Inc",
    "azureTenantId": "12345678-1234-1234-1234-123456789012",
    "settings": {
      "defaultTaxonomyId": "770e8400-e29b-41d4-a716-446655440000"
    },
    "createdAt": "2025-01-01T00:00:00Z"
  }
}
```

## User Provisioning

When a user logs in for the first time:

1. **Organization lookup** — Find or create org by Azure tenant ID
2. **User lookup** — Find or create user by Azure user ID
3. **Association** — Link user to organization

```typescript
// Automatic provisioning in auth middleware
const org = await findOrCreateOrganization(tenantId, tenantName);
const user = await findOrCreateUser(org.id, azureUserId, email, displayName);
```

## Multi-Tenant Support

Cluster supports multiple Azure AD tenants:

| Configuration | Description |
|--------------|-------------|
| **Single-tenant** | One Azure AD tenant, one Cluster organization |
| **Multi-tenant** | Multiple tenants, each creates separate organization |

### Single-Tenant Setup

```bash
# Server environment
AZURE_TENANT_ID=12345678-1234-1234-1234-123456789012
```

### Multi-Tenant Setup

```bash
# Server environment - use 'common' for any tenant
AZURE_TENANT_ID=common
```

Each tenant's users are isolated to their own organization. Data is filtered by `org_id` on all queries.

## Organization Isolation

All API requests are scoped to the user's organization:

```typescript
// Every query includes org_id filter
const annotations = await db
  .select()
  .from(annotations)
  .where(eq(annotations.orgId, req.user.orgId));
```

Users cannot access data from other organizations.

## Token Refresh

Access tokens expire after 1 hour. The frontend uses MSAL to silently refresh tokens:

```typescript
// Frontend token refresh
const account = msalInstance.getActiveAccount();
const response = await msalInstance.acquireTokenSilent({
  scopes: ['api://your-client-id/.default'],
  account,
});
```

## SharePoint Access

For SharePoint operations, the API uses the **On-Behalf-Of** flow:

1. Frontend sends user's access token
2. API exchanges token for SharePoint-scoped token
3. API calls Microsoft Graph with new token

```typescript
// On-behalf-of token exchange
const oboToken = await cca.acquireTokenOnBehalfOf({
  oboAssertion: userToken,
  scopes: ['https://graph.microsoft.com/Files.Read.All'],
});
```

## Error Responses

### 401 Unauthorized

Missing or invalid token:

```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or expired access token"
  }
}
```

### 403 Forbidden

Token valid but insufficient permissions:

```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "You do not have access to this resource"
  }
}
```

## Security Headers

The API sets security headers on all responses:

```http
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Content-Security-Policy: default-src 'self'
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

## Testing Without Azure AD

For local development without Azure AD:

```bash
# Enable development mode (bypasses token validation)
NODE_ENV=development
DEV_USER_EMAIL=developer@localhost
DEV_USER_NAME=Developer
DEV_ORG_ID=dev-org-id
```

:::caution
Never use development mode in production.
:::

## Next Steps

- [Annotations API](/api/annotations) — Create and manage annotations
- [Files API](/api/files) — Access SharePoint files
