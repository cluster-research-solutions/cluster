# Testing Guide

This guide will help you test the complete Azure AD authentication flow and SharePoint integration.

## Prerequisites

Before testing, ensure you have:

1. ✅ Azure AD app registered (see [azure-setup.md](./azure-setup.md))
2. ✅ Environment variables configured (`.env` files)
3. ✅ PostgreSQL database running
4. ✅ Dependencies installed (`pnpm install`)

## Step 1: Start PostgreSQL

### Option A: Using Docker

```bash
docker run -d \
  --name research-postgres \
  -e POSTGRES_USER=research \
  -e POSTGRES_PASSWORD=devpassword \
  -e POSTGRES_DB=research_annotations \
  -p 5432:5432 \
  postgres:15-alpine
```

### Option B: Local PostgreSQL

Ensure PostgreSQL is running and create the database:

```bash
createdb research_annotations
```

## Step 2: Run Database Migrations

```bash
cd packages/server
pnpm db:generate
pnpm db:migrate
```

Expected output:
```
✓ Migration files generated
✓ Migrations applied successfully
```

## Step 3: Start Development Servers

From the root directory:

```bash
pnpm dev
```

This starts:
- **Server**: http://localhost:4000
- **Web**: http://localhost:3000

Expected console output:
```
> @research-annotations/server@0.1.0 dev
> tsx watch src/index.ts

🚀 Server running on http://localhost:4000
📊 Environment: development

> @research-annotations/web@0.1.0 dev
> vite

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

## Step 4: Test Authentication Flow

### 4.1 Initial Page Load

1. Open http://localhost:3000
2. You should see:
   - Header: "Research Annotations Platform"
   - Welcome message
   - "Sign in with Microsoft" button

### 4.2 Login

1. Click "Sign in with Microsoft"
2. A popup window should open with Microsoft login
3. Enter your credentials
4. Grant permissions when prompted
5. Popup should close automatically

**Expected Result**: You should now see:
- Your profile name/email in the header
- "Sign out" button
- System Status card showing:
  - ✓ API Health: ok
  - ✓ Authentication: Active
- User Information card with your email and organization
- SharePoint Sites card (may be empty if no sites accessible)

### 4.3 Verify Authentication

Open browser DevTools → Console, you should NOT see:
- ❌ CORS errors
- ❌ 401 Unauthorized errors
- ❌ Token errors

You SHOULD see:
- ✅ Successful API calls to `/api/health`
- ✅ Successful API calls to `/api/auth/status`
- ✅ Successful API calls to `/api/files/sites`

### 4.4 Check Database

Verify that your organization and user were created:

```bash
# Connect to database
docker exec -it research-postgres psql -U research research_annotations

# Check organizations
SELECT id, name, azure_tenant_id FROM organizations;

# Check users
SELECT id, email, display_name FROM users;

# Exit
\q
```

Expected result: You should see your organization and user record.

### 4.5 Logout

1. Click "Sign out" button
2. Popup should open briefly
3. Page should refresh and show welcome screen again

## Step 5: Test SharePoint Integration

### 5.1 View SharePoint Sites

If authenticated, you should see a list of SharePoint sites you have access to.

**Troubleshooting if no sites appear:**

1. Check browser console for errors
2. Verify API permissions in Azure AD:
   - `Sites.Read.All` should be granted
   - Admin consent should be approved
3. Test the API directly:
   ```bash
   # Get an access token from browser DevTools → Application → Session Storage
   # Look for: msal.{client-id}.accesstoken

   curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
     http://localhost:4000/api/files/sites
   ```

### 5.2 Test File Access

Once you have sites, you can test deeper SharePoint integration:

```bash
# List drives for a site
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  http://localhost:4000/api/files/sites/{SITE_ID}/drives

# List items in a drive
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  "http://localhost:4000/api/files/drives/{DRIVE_ID}/items?itemId=root"
```

## Step 6: Test API Health Endpoint

The health endpoint doesn't require auth:

```bash
curl http://localhost:4000/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-01-03T...",
  "service": "research-annotations-api"
}
```

## Common Issues

### Issue: "AADSTS700016: Application not found"

**Solution**:
- Verify `AZURE_CLIENT_ID` in both `.env` and `packages/web/.env`
- Ensure they match your Azure AD app registration

### Issue: "AADSTS50011: Redirect URI mismatch"

**Solution**:
- Check redirect URIs in Azure AD app registration
- Must include: `http://localhost:3000`
- No trailing slash

### Issue: "Failed to fetch sites" or empty sites list

**Solution**:
1. Verify API permissions in Azure AD
2. Ensure admin consent is granted
3. Check that your account has access to SharePoint sites
4. Try logging into https://yourorg.sharepoint.com to verify access

### Issue: "Database connection error"

**Solution**:
```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Check connection string in .env
echo $DATABASE_URL

# Test connection
docker exec -it research-postgres psql -U research research_annotations -c "SELECT 1;"
```

### Issue: CORS errors in browser console

**Solution**:
- Verify `WEB_URL` in server `.env` matches the frontend URL
- Check CORS configuration in `packages/server/src/index.ts`

### Issue: Token expires quickly

**Solution**:
- This is normal for development
- MSAL will automatically refresh tokens
- If issues persist, try logging out and back in

## Verification Checklist

After testing, verify all these work:

- [ ] Can see login button when not authenticated
- [ ] Login popup opens and works
- [ ] After login, see user profile in header
- [ ] API health shows "ok"
- [ ] Auth status shows "Active"
- [ ] User information displays correctly
- [ ] Organization is created in database
- [ ] User record is created in database
- [ ] Can see SharePoint sites (if available)
- [ ] Logout works and returns to welcome screen
- [ ] Can log back in after logging out

## Next Steps

Once authentication is working:

1. **Phase 2: File Browsing**
   - Build file browser UI
   - Implement drive/folder navigation
   - Add file preview capabilities

2. **Phase 3: Annotation Core**
   - Create annotation UI
   - Implement text selection
   - Build tag system

3. **Phase 4: Media + Transcript**
   - Video player integration
   - Transcript parsing
   - Time-sync functionality

See [CLAUDE.md](../CLAUDE.md) for the full MVP roadmap.
