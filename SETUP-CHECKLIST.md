# Setup Checklist

Use this checklist to track your setup progress.

## Phase 1: Install Prerequisites

- [ ] **Install Node.js 18+**
  ```bash
  node --version  # Should show v18.x.x or higher
  ```
  If not installed: See [docs/SETUP.md](docs/SETUP.md#1-install-nodejs)

- [ ] **Install pnpm**
  ```bash
  pnpm --version  # Should show v8.x.x or higher
  ```
  If not installed: `npm install -g pnpm`

- [ ] **Install PostgreSQL 15**
  ```bash
  psql --version  # Should show 15.x
  ```
  If not installed: `brew install postgresql@15`

- [ ] **Start PostgreSQL**
  ```bash
  brew services start postgresql@15
  ```

- [ ] **Create database**
  ```bash
  createdb research_annotations
  psql -d research_annotations -c "SELECT 1;"  # Should return 1
  ```

## Phase 2: Project Setup

- [ ] **Navigate to project**
  ```bash
  cd /Users/ericssoncolborn/Documents/code_projects/sharepoint-insights
  ```

- [ ] **Install dependencies**
  ```bash
  pnpm install
  ```
  This may take a few minutes.

- [ ] **Build shared package**
  ```bash
  cd packages/shared
  pnpm build
  cd ../..
  ```

- [ ] **Verify environment files exist**
  ```bash
  ls -la .env packages/web/.env
  ```
  Both should exist. If not, they were created automatically.

## Phase 3: Azure AD Configuration

- [ ] **Go to Azure Portal**
  Open: https://portal.azure.com

- [ ] **Register application**
  Follow: [docs/azure-setup.md](docs/azure-setup.md)

  Key steps:
  - Create app registration
  - Add redirect URI: `http://localhost:3000`
  - Configure API permissions
  - Create client secret

- [ ] **Copy Azure credentials**
  You'll need:
  - Tenant ID (Directory ID)
  - Client ID (Application ID)
  - Client Secret (Value)

- [ ] **Update `.env` (server)**
  ```bash
  nano .env
  ```
  Update:
  - `AZURE_TENANT_ID=your-tenant-id`
  - `AZURE_CLIENT_ID=your-client-id`
  - `AZURE_CLIENT_SECRET=your-client-secret`
  - Generate `SESSION_SECRET` with: `openssl rand -base64 32`

- [ ] **Update `packages/web/.env` (frontend)**
  ```bash
  nano packages/web/.env
  ```
  Update:
  - `VITE_AZURE_CLIENT_ID=your-client-id`
  - `VITE_AZURE_TENANT_ID=your-tenant-id`

## Phase 4: Database Setup

- [ ] **Generate migrations**
  ```bash
  cd packages/server
  pnpm db:generate
  ```

- [ ] **Run migrations**
  ```bash
  pnpm db:migrate
  ```

- [ ] **Verify tables created**
  ```bash
  psql -d research_annotations -c "\dt"
  ```
  Should show tables: annotations, organizations, users, etc.

- [ ] **Return to root**
  ```bash
  cd ../..
  ```

## Phase 5: Start Development

- [ ] **Start dev servers**
  ```bash
  pnpm dev
  ```

  Should see:
  - 🚀 Server running on http://localhost:4000
  - ➜ Local: http://localhost:3000/

- [ ] **Verify API health**
  Open new terminal:
  ```bash
  curl http://localhost:4000/api/health
  ```
  Should return: `{"status":"ok", ...}`

- [ ] **Open web app**
  Open browser to: http://localhost:3000

  Should see:
  - "Research Annotations Platform" header
  - "Sign in with Microsoft" button
  - No console errors

## Phase 6: Test Authentication

- [ ] **Click "Sign in with Microsoft"**
  Popup should open

- [ ] **Login with Microsoft account**
  Use account that has SharePoint access

- [ ] **Grant permissions**
  Accept the permission requests

- [ ] **Verify login successful**
  After login, you should see:
  - Your name/email in header
  - "Sign out" button
  - System Status showing green checkmarks
  - User Information card
  - SharePoint Sites list (may be empty)

- [ ] **Check database**
  ```bash
  psql -d research_annotations -c "SELECT * FROM organizations;"
  psql -d research_annotations -c "SELECT email FROM users;"
  ```
  Should show your organization and user

- [ ] **Test logout**
  Click "Sign out" - should return to welcome screen

## Troubleshooting

If you encounter issues, check:

- [ ] **Node.js installed and in PATH**
  ```bash
  which node
  node --version
  ```

- [ ] **PostgreSQL running**
  ```bash
  brew services list | grep postgresql
  ```

- [ ] **Port 3000 and 4000 available**
  ```bash
  lsof -i :3000
  lsof -i :4000
  ```

- [ ] **Environment variables set correctly**
  ```bash
  cat .env | grep AZURE
  cat packages/web/.env | grep AZURE
  ```

- [ ] **Shared package built**
  ```bash
  ls packages/shared/dist/
  ```
  Should show compiled .js and .d.ts files

## Common Issues & Solutions

### "pnpm: command not found"
```bash
npm install -g pnpm
source ~/.zshrc
```

### "Cannot find module '@research-annotations/shared'"
```bash
cd packages/shared && pnpm build && cd ../..
```

### "Connection refused" (database)
```bash
brew services start postgresql@15
createdb research_annotations
```

### "Module not found" TypeScript errors
```bash
pnpm clean
pnpm install
cd packages/shared && pnpm build && cd ../..
```

### CORS errors in browser
Check that `WEB_URL=http://localhost:3000` in `.env`

## Success Criteria

You're ready to start development when:

✅ `pnpm dev` starts without errors
✅ http://localhost:3000 loads
✅ http://localhost:4000/api/health returns "ok"
✅ Login button appears
✅ Can successfully log in with Microsoft
✅ User and organization created in database

## Next Steps

Once setup is complete:

1. **Explore the codebase**
   - `packages/shared` - Type definitions
   - `packages/server` - API server
   - `packages/web` - React frontend

2. **Read the architecture docs**
   - [CLAUDE.md](CLAUDE.md) - Full technical spec
   - [docs/api-reference.md](docs/api-reference.md) - API endpoints

3. **Start Phase 2: File Browsing**
   - Build file browser UI
   - Implement navigation
   - Add file preview

Happy coding! 🚀
