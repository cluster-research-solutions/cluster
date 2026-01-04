# Azure AD Setup Guide

This guide walks you through setting up Azure AD authentication for the Research Annotations Platform.

## Prerequisites

- Azure subscription with access to Azure Active Directory
- Admin permissions to register applications
- Microsoft 365 tenant with SharePoint

## Step 1: Register Application in Azure AD

1. Navigate to [Azure Portal](https://portal.azure.com)
2. Go to **Azure Active Directory** → **App registrations**
3. Click **New registration**

### Application Details

- **Name**: `Research Annotations Platform` (or your preferred name)
- **Supported account types**:
  - Choose "Accounts in this organizational directory only" for single-tenant
  - Or "Accounts in any organizational directory" for multi-tenant
- **Redirect URI**:
  - Platform: **Single-page application (SPA)**
  - URI: `http://localhost:3000` (add production URL later)

4. Click **Register**

## Step 2: Copy Application IDs

After registration, you'll see the application overview page:

1. Copy the **Application (client) ID** → This is your `AZURE_CLIENT_ID`
2. Copy the **Directory (tenant) ID** → This is your `AZURE_TENANT_ID`

## Step 3: Create Client Secret

1. In your app registration, go to **Certificates & secrets**
2. Click **New client secret**
3. Add a description (e.g., "Dev secret")
4. Choose an expiration period (recommended: 6-12 months for dev)
5. Click **Add**
6. **IMPORTANT**: Copy the **Value** immediately → This is your `AZURE_CLIENT_SECRET`
   - ⚠️ You won't be able to see this again!

## Step 4: Configure API Permissions

1. Go to **API permissions**
2. Click **Add a permission**

### Microsoft Graph Permissions (Delegated)

Add these delegated permissions:

| Permission | Type | Purpose |
|------------|------|---------|
| `User.Read` | Delegated | Read signed-in user profile |
| `Files.Read.All` | Delegated | Read all files user can access |
| `Sites.Read.All` | Delegated | Read items in all site collections |

3. Click **Add permissions** for each
4. Click **Grant admin consent for [Your Organization]**
   - This requires admin privileges
   - If you don't have admin access, request it from your IT department

## Step 5: Configure Authentication Settings

1. Go to **Authentication**
2. Under **Platform configurations** → **Single-page application**:
   - Verify redirect URI: `http://localhost:3000`
   - Add production URL when ready

3. Under **Implicit grant and hybrid flows**:
   - ✅ Check **Access tokens**
   - ✅ Check **ID tokens**

4. Under **Advanced settings**:
   - **Allow public client flows**: No
   - **Enable the following mobile and desktop flows**: No

5. Click **Save**

## Step 6: Add Redirect URIs for Development

Under **Authentication** → **Platform configurations** → **Single-page application**, add:

- `http://localhost:3000`
- `http://localhost:3000/auth/callback` (if using callback route)

For production, add:
- `https://yourdomain.com`
- `https://yourdomain.com/auth/callback`

## Step 7: Configure Environment Variables

### Server (.env)

```bash
AZURE_TENANT_ID=your-directory-tenant-id-here
AZURE_CLIENT_ID=your-application-client-id-here
AZURE_CLIENT_SECRET=your-client-secret-value-here
```

### Web (packages/web/.env)

```bash
VITE_AZURE_CLIENT_ID=your-application-client-id-here
VITE_AZURE_TENANT_ID=your-directory-tenant-id-here
VITE_API_URL=http://localhost:4000/api
```

## Step 8: Verify Permissions

Your app should now have:

### API Permissions
```
Microsoft Graph (3)
├── Files.Read.All (Delegated)
├── Sites.Read.All (Delegated)
└── User.Read (Delegated)
```

Admin consent status: ✅ Granted for [Your Organization]

## Testing the Setup

1. Start the development servers:
   ```bash
   pnpm dev
   ```

2. Open http://localhost:3000

3. Click "Sign in with Microsoft"

4. You should be redirected to Microsoft login

5. After authentication, you should see your profile information

## Troubleshooting

### Error: "AADSTS700016: Application not found"
- Check that `AZURE_CLIENT_ID` matches your app registration
- Verify you're using the correct tenant

### Error: "AADSTS50011: Redirect URI mismatch"
- Verify redirect URI in Azure matches exactly: `http://localhost:3000`
- Check for trailing slashes (shouldn't have one)

### Error: "AADSTS65001: User consent required"
- Admin needs to grant consent for delegated permissions
- Or enable user consent in Azure AD settings

### Error: "Access token not valid for Microsoft Graph"
- Verify API permissions are configured correctly
- Check admin consent is granted

## Security Notes

### For Development
- Use separate client secrets for dev/staging/production
- Never commit `.env` files to version control
- Rotate secrets regularly

### For Production
- Use Azure Key Vault for secrets
- Enable Conditional Access policies
- Configure token lifetime policies
- Add production redirect URIs only when ready
- Consider using Managed Identities for server-to-server calls

## Additional Resources

- [Microsoft Identity Platform Documentation](https://learn.microsoft.com/en-us/azure/active-directory/develop/)
- [MSAL.js Documentation](https://github.com/AzureAD/microsoft-authentication-library-for-js)
- [Microsoft Graph API Reference](https://learn.microsoft.com/en-us/graph/api/overview)
