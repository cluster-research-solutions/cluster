---
sidebar_position: 2
title: Azure AD Setup
---

# Azure AD Setup

This guide walks you through configuring Azure AD authentication for Cluster.

## Prerequisites

- Azure subscription with Azure Active Directory
- Admin permissions to register applications
- Microsoft 365 tenant with SharePoint

## Step 1: Register Application

1. Navigate to [Azure Portal](https://portal.azure.com)
2. Go to **Azure Active Directory** → **App registrations**
3. Click **New registration**

### Application Details

| Field | Value |
|-------|-------|
| **Name** | `Cluster Research Platform` |
| **Supported account types** | Accounts in this organizational directory only (single-tenant) |
| **Redirect URI** | Single-page application (SPA): `http://localhost:3000` |

4. Click **Register**

## Step 2: Copy Application IDs

After registration, copy these values:

| Value | Location | Environment Variable |
|-------|----------|---------------------|
| **Application (client) ID** | Overview page | `AZURE_CLIENT_ID` |
| **Directory (tenant) ID** | Overview page | `AZURE_TENANT_ID` |

## Step 3: Create Client Secret

1. Go to **Certificates & secrets**
2. Click **New client secret**
3. Add description: `Cluster API`
4. Choose expiration: 12 months (or per your policy)
5. Click **Add**
6. **Copy the Value immediately** → `AZURE_CLIENT_SECRET`

:::caution
The secret value is only shown once. Copy it now or you'll need to create a new one.
:::

## Step 4: Configure API Permissions

1. Go to **API permissions**
2. Click **Add a permission**
3. Select **Microsoft Graph**
4. Select **Delegated permissions**

Add these permissions:

| Permission | Type | Purpose |
|------------|------|---------|
| `User.Read` | Delegated | Read signed-in user profile |
| `Files.Read.All` | Delegated | Read SharePoint/OneDrive files |
| `Sites.Read.All` | Delegated | List SharePoint sites |

5. Click **Grant admin consent for [Your Organization]**

### Verify Permissions

Your permissions should look like:

```
Microsoft Graph (3)
├── Files.Read.All (Delegated) ✓ Granted
├── Sites.Read.All (Delegated) ✓ Granted
└── User.Read (Delegated) ✓ Granted
```

## Step 5: Configure Authentication

1. Go to **Authentication**
2. Under **Single-page application**, verify:
   - Redirect URI: `http://localhost:3000`

3. Add production URIs when ready:
   - `https://cluster.yourcompany.com`

4. Under **Implicit grant and hybrid flows**:
   - ✅ Access tokens
   - ✅ ID tokens

5. Click **Save**

## Step 6: Configure Cluster

### Server Environment (.env)

```bash
AZURE_TENANT_ID=12345678-1234-1234-1234-123456789012
AZURE_CLIENT_ID=87654321-4321-4321-4321-210987654321
AZURE_CLIENT_SECRET=abc123~YourSecretValue
```

### Web Environment (packages/web/.env)

```bash
VITE_AZURE_CLIENT_ID=87654321-4321-4321-4321-210987654321
VITE_AZURE_TENANT_ID=12345678-1234-1234-1234-123456789012
VITE_API_URL=http://localhost:4000/api
```

## Step 7: Test Authentication

1. Start Cluster:
   ```bash
   pnpm dev
   ```

2. Open http://localhost:3000

3. Click **Sign in with Microsoft**

4. Authenticate with your organization credentials

5. Grant permissions when prompted

### Verify Success

After login, you should see:
- Your name/email in the header
- "Sign out" button
- SharePoint sites list (if you have access)

## Troubleshooting

### "AADSTS700016: Application not found"

- Verify `AZURE_CLIENT_ID` matches your app registration
- Check you're using the correct tenant

### "AADSTS50011: Redirect URI mismatch"

- Verify redirect URI in Azure exactly matches: `http://localhost:3000`
- No trailing slash
- Must be SPA platform, not Web

### "AADSTS65001: User consent required"

- Admin needs to grant consent for delegated permissions
- Go to **API permissions** → **Grant admin consent**

### "Access token not valid for Microsoft Graph"

- Verify all three permissions are added
- Ensure admin consent is granted
- Try logging out and back in

### "Unable to fetch SharePoint sites"

- Verify `Sites.Read.All` permission is granted
- Check that your account has access to SharePoint
- Test by visiting https://yourorg.sharepoint.com

## Multi-Tenant Configuration

To allow users from any Azure AD tenant:

1. Change **Supported account types** to:
   - "Accounts in any organizational directory (Any Azure AD directory - Multitenant)"

2. Users from different tenants will create separate organizations in Cluster

## Production Checklist

Before going to production:

- [ ] Add production redirect URI (`https://your-domain.com`)
- [ ] Remove `localhost` redirect URI
- [ ] Rotate client secret
- [ ] Enable Conditional Access policies (optional)
- [ ] Configure token lifetime (optional)

## Next Steps

- [Installation](/self-hosting/installation) — Complete setup
- [Running Cluster](/self-hosting/running) — Start the application
