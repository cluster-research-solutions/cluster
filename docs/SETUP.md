# Complete Setup Guide

Step-by-step setup for the Research Annotations Platform on M1 Mac.

## Prerequisites Installation

### 1. Install Homebrew (if not installed)

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### 2. Install Node.js

We need Node.js 18 or higher:

```bash
# Option A: Install via Homebrew
brew install node@20

# Add to PATH (add to ~/.zshrc or ~/.bash_profile)
echo 'export PATH="/opt/homebrew/opt/node@20/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# Option B: Install via nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.zshrc
nvm install 20
nvm use 20
```

Verify installation:
```bash
node --version  # Should show v20.x.x
npm --version   # Should show v10.x.x
```

### 3. Install pnpm

```bash
npm install -g pnpm
pnpm --version  # Should show v8.x.x
```

### 4. Install PostgreSQL

```bash
# Install PostgreSQL 15
brew install postgresql@15

# Start PostgreSQL
brew services start postgresql@15

# Create the database
createdb research_annotations

# Test connection
psql -d research_annotations -c "SELECT 1;"
```

Expected output:
```
 ?column?
----------
        1
(1 row)
```

## Project Setup

### 1. Navigate to Project Directory

```bash
cd /Users/ericssoncolborn/Documents/code_projects/sharepoint-insights
```

### 2. Install Dependencies

```bash
pnpm install
```

This will install dependencies for all packages (shared, server, web).

### 3. Build Shared Package

The `shared` package contains TypeScript types used by both server and web:

```bash
cd packages/shared
pnpm build
cd ../..
```

### 4. Configure Environment Variables

Two environment files need Azure AD credentials:

#### Server Environment (`.env`)

```bash
# Already created, now edit it:
nano .env
```

Update these values (get from Azure AD app registration):
```bash
AZURE_TENANT_ID=paste-your-tenant-id-here
AZURE_CLIENT_ID=paste-your-client-id-here
AZURE_CLIENT_SECRET=paste-your-client-secret-here

# Database (if using Homebrew PostgreSQL)
DATABASE_URL=postgresql://$(whoami)@localhost:5432/research_annotations

# Session secret - generate a random string
SESSION_SECRET=$(openssl rand -base64 32)
```

Save and exit (Ctrl+X, then Y, then Enter).

#### Web Environment (`packages/web/.env`)

```bash
nano packages/web/.env
```

Update:
```bash
VITE_AZURE_CLIENT_ID=paste-your-client-id-here
VITE_AZURE_TENANT_ID=paste-your-tenant-id-here
VITE_API_URL=http://localhost:4000/api
```

Save and exit.

### 5. Set Up Database

```bash
cd packages/server

# Generate migration files from schema
pnpm db:generate

# Run migrations to create tables
pnpm db:migrate

cd ../..
```

Expected output:
```
✓ Migrations generated
✓ Applied migrations successfully
```

## Start Development

### Start Both Servers

From the root directory:

```bash
pnpm dev
```

You should see:
```
> @research-annotations/server@0.1.0 dev
> tsx watch src/index.ts

🚀 Server running on http://localhost:4000
📊 Environment: development

> @research-annotations/web@0.1.0 dev
> vite

  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

### Access the Application

Open your browser to: **http://localhost:3000**

You should see the Research Annotations Platform welcome screen.

## Before You Can Log In

You need to register an Azure AD application. Follow this guide:

**[Azure Setup Guide](./azure-setup.md)**

Key steps:
1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to Azure Active Directory → App registrations
3. Create a new registration
4. Configure permissions (User.Read, Files.Read.All, Sites.Read.All)
5. Create a client secret
6. Copy the IDs and secret to your `.env` files

## Verify Setup

### 1. Check API Health

```bash
curl http://localhost:4000/api/health
```

Expected:
```json
{
  "status": "ok",
  "timestamp": "2025-01-03T...",
  "service": "research-annotations-api"
}
```

### 2. Check Database

```bash
psql -d research_annotations -c "\dt"
```

You should see tables:
```
                    List of relations
 Schema |          Name          | Type  |     Owner
--------+------------------------+-------+---------------
 public | affinity_group_items   | table | your_username
 public | affinity_groups        | table | your_username
 public | annotation_tags        | table | your_username
 public | annotation_targets     | table | your_username
 public | annotations            | table | your_username
 ...
```

### 3. Test Frontend

Open http://localhost:3000 - you should see:
- ✅ Page loads without errors
- ✅ "Sign in with Microsoft" button visible
- ✅ No console errors (check browser DevTools)

## Common Issues

### "pnpm: command not found"

```bash
npm install -g pnpm
source ~/.zshrc
```

### "Module not found: @research-annotations/shared"

```bash
cd packages/shared
pnpm build
cd ../..
pnpm dev
```

### "Connection refused" database error

PostgreSQL isn't running:
```bash
brew services start postgresql@15
```

### "Cannot connect to database"

Check your `DATABASE_URL` in `.env`:
```bash
# Should be:
DATABASE_URL=postgresql://$(whoami)@localhost:5432/research_annotations
```

Test manually:
```bash
psql -d research_annotations
```

If that works, your URL is correct.

### Port already in use

```bash
# Find what's using the port
lsof -i :3000
lsof -i :4000

# Kill it
kill -9 <PID>
```

## Quick Commands Reference

```bash
# Install everything
pnpm install

# Build shared package
cd packages/shared && pnpm build && cd ../..

# Start dev servers
pnpm dev

# Run database migrations
cd packages/server && pnpm db:migrate && cd ../..

# Open database
psql -d research_annotations

# Check PostgreSQL status
brew services list | grep postgresql

# Restart PostgreSQL
brew services restart postgresql@15
```

## Next Steps

1. ✅ Complete basic setup (you're here)
2. 📝 Register Azure AD app: [azure-setup.md](./azure-setup.md)
3. 🧪 Test authentication: [testing-guide.md](./testing-guide.md)
4. 🚀 Start building features!

## Need Help?

Check the troubleshooting sections in:
- [M1 Mac Setup Guide](./m1-mac-setup.md)
- [Testing Guide](./testing-guide.md)
- [Azure Setup Guide](./azure-setup.md)
