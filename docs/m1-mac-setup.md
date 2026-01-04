# M1 Mac Setup Guide

Quick setup guide for Apple Silicon (M1/M2/M3) Macs.

## Step 1: Install PostgreSQL

You have two options:

### Option A: Homebrew (Recommended for M1)

```bash
# Install PostgreSQL
brew install postgresql@15

# Start PostgreSQL service
brew services start postgresql@15

# Create database
createdb research_annotations

# Verify it's running
psql -d research_annotations -c "SELECT version();"
```

### Option B: Postgres.app

1. Download [Postgres.app](https://postgresapp.com/)
2. Install and open it
3. Click "Initialize" to create a new server
4. Click on the database in the app to open psql
5. Run: `CREATE DATABASE research_annotations;`

### Option C: Docker (if you prefer)

```bash
# Start Docker Desktop first, then:
docker run -d \
  --name research-postgres \
  --platform linux/amd64 \
  -e POSTGRES_USER=research \
  -e POSTGRES_PASSWORD=devpassword \
  -e POSTGRES_DB=research_annotations \
  -p 5432:5432 \
  postgres:15-alpine
```

Note: Use `--platform linux/amd64` for M1 compatibility.

## Step 2: Install Dependencies

```bash
# Install pnpm if you haven't
npm install -g pnpm

# Install project dependencies
pnpm install
```

## Step 3: Configure Environment

The environment files have been created. Now update them with your Azure credentials:

### Edit `.env` (server)

```bash
# Use your preferred editor
nano .env
# or
code .env
# or
vim .env
```

Update these values:
```bash
AZURE_TENANT_ID=your-actual-tenant-id
AZURE_CLIENT_ID=your-actual-client-id
AZURE_CLIENT_SECRET=your-actual-client-secret

# If using Homebrew PostgreSQL:
DATABASE_URL=postgresql://$(whoami)@localhost:5432/research_annotations

# If using Docker PostgreSQL (as configured above):
DATABASE_URL=postgresql://research:devpassword@localhost:5432/research_annotations

# Generate a secure session secret:
SESSION_SECRET=$(openssl rand -base64 32)
```

### Edit `packages/web/.env` (frontend)

```bash
nano packages/web/.env
# or
code packages/web/.env
```

Update:
```bash
VITE_AZURE_CLIENT_ID=your-actual-client-id
VITE_AZURE_TENANT_ID=your-actual-tenant-id
```

## Step 4: Set Up Database Schema

```bash
cd packages/server

# Generate migrations
pnpm db:generate

# Apply migrations
pnpm db:migrate

# Return to root
cd ../..
```

## Step 5: Start Development

```bash
pnpm dev
```

This starts:
- API server on http://localhost:4000
- Web app on http://localhost:3000

## Troubleshooting

### "Module not found" errors

```bash
# Clean and reinstall
pnpm clean
rm -rf node_modules
rm -rf packages/*/node_modules
pnpm install
```

### TypeScript errors in VSCode

```bash
# Rebuild TypeScript projects
pnpm build
```

Then restart VSCode TypeScript server:
- Cmd+Shift+P → "TypeScript: Restart TS Server"

### PostgreSQL connection errors

Check if PostgreSQL is running:

```bash
# For Homebrew:
brew services list | grep postgresql

# For Docker:
docker ps | grep postgres

# For Postgres.app:
# Check if the app shows the server as running
```

Test connection:
```bash
psql -d research_annotations -c "SELECT 1;"
```

### Port already in use

If port 3000 or 4000 is already taken:

```bash
# Find what's using the port
lsof -i :3000
lsof -i :4000

# Kill the process (replace PID with actual process ID)
kill -9 PID
```

Or change the port in `.env`:
```bash
PORT=4001  # for API
```

And `packages/web/vite.config.ts`:
```typescript
server: {
  port: 3001,  // for web
}
```

### M1-specific Docker issues

If you get "exec format error" with Docker:

1. Make sure you're using `--platform linux/amd64` flag
2. Or use Rosetta 2:
   ```bash
   softwareupdate --install-rosetta
   ```

### "Cannot find module '@research-annotations/shared'"

The shared package needs to be built first:

```bash
cd packages/shared
pnpm build
cd ../..
pnpm dev
```

## Quick Reset

If you need to start fresh:

```bash
# Stop all processes (Ctrl+C)

# Drop and recreate database
dropdb research_annotations
createdb research_annotations

# Clean and reinstall
pnpm clean
pnpm install

# Rebuild everything
cd packages/shared && pnpm build && cd ../..
cd packages/server && pnpm db:generate && pnpm db:migrate && cd ../..

# Start again
pnpm dev
```

## Next Steps

Once everything is running:

1. Register your Azure AD app: [azure-setup.md](./azure-setup.md)
2. Test the auth flow: [testing-guide.md](./testing-guide.md)
