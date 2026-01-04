# Research Annotations Platform

A W3C Web Annotation-compliant platform for UX research teams to annotate, tag, link, and synthesize research data stored in SharePoint.

## Project Structure

```
research-annotations/
├── packages/
│   ├── shared/          # Shared TypeScript types and Zod schemas
│   ├── server/          # Express API server
│   └── web/             # React frontend (Vite)
├── docker-compose.yml   # (To be created)
└── docs/                # (To be created)
```

## Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- PostgreSQL 15
- Azure AD tenant with app registration

## Getting Started

### First Time Setup

**📖 Follow the complete setup guide: [docs/SETUP.md](docs/SETUP.md)**

This guide covers:
1. Installing Node.js, pnpm, and PostgreSQL on M1 Mac
2. Installing project dependencies
3. Configuring environment variables
4. Setting up the database
5. Starting the development servers

### Quick Start (if dependencies already installed)

```bash
# 1. Install dependencies
pnpm install

# 2. Build shared package
cd packages/shared && pnpm build && cd ../..

# 3. Set up database
cd packages/server && pnpm db:migrate && cd ../..

# 4. Start development servers
pnpm dev
```

### Environment Configuration

Environment files have been created at:
- `.env` (server configuration)
- `packages/web/.env` (frontend configuration)

**You must update these with your Azure AD credentials** before the app will work.

See [docs/azure-setup.md](docs/azure-setup.md) for instructions on getting Azure credentials.

### Database Setup

```bash
# Install PostgreSQL
brew install postgresql@15

# Start PostgreSQL
brew services start postgresql@15

# Create database
createdb research_annotations

# Run migrations
cd packages/server
pnpm db:migrate
cd ../..
```

### Start Development Servers

From the root directory:

```bash
pnpm dev
```

This will start:
- **API Server**: http://localhost:4000
- **Web App**: http://localhost:3000

## Package Scripts

### Root
- `pnpm dev` - Start all packages in dev mode
- `pnpm build` - Build all packages
- `pnpm clean` - Clean all build artifacts
- `pnpm typecheck` - Type check all packages

### Server (`packages/server`)
- `pnpm dev` - Start dev server with hot reload
- `pnpm build` - Build for production
- `pnpm db:generate` - Generate Drizzle migrations
- `pnpm db:migrate` - Run migrations
- `pnpm db:studio` - Open Drizzle Studio

### Web (`packages/web`)
- `pnpm dev` - Start Vite dev server
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build

### Shared (`packages/shared`)
- `pnpm build` - Build TypeScript types
- `pnpm dev` - Watch mode for types

## Technology Stack

### Frontend
- **React** 18 with TypeScript
- **Vite** for build tooling
- **TanStack Query** for server state
- **Tailwind CSS** for styling
- **MSAL** for Azure AD authentication
- **Zustand** for client state (when needed)

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **Drizzle ORM** with PostgreSQL
- **Zod** for validation
- **Microsoft Graph API** for SharePoint integration

### Shared
- **W3C Web Annotation types**
- **Zod schemas** for validation
- **Research-specific extensions**

## Project Status

### ✅ Phase 1: Core Infrastructure (Complete)
- [x] Monorepo setup
- [x] TypeScript configuration
- [x] W3C annotation types
- [x] Zod validation schemas
- [x] Express server skeleton
- [x] Drizzle ORM schema
- [x] React app skeleton
- [x] MSAL auth setup
- [x] Azure AD integration
- [x] Auth middleware (server)
- [x] Microsoft Graph client
- [x] Login/logout UI
- [x] SharePoint file listing

### 🚀 Ready to Test
Follow the guides in `docs/`:
- [Azure Setup Guide](docs/azure-setup.md) - Register your Azure AD app
- [Testing Guide](docs/testing-guide.md) - Test the complete auth flow

### 📋 Next Steps: Phase 2 - File Browsing
- [ ] File browser UI component
- [ ] Drive/folder navigation
- [ ] File metadata display
- [ ] Video/audio preview
- [ ] Transcript file detection

See [CLAUDE.md](CLAUDE.md) for the full technical specification and MVP checklist.

## Architecture

The platform follows W3C Web Annotation standards:
- Annotations stored in org-controlled PostgreSQL
- Source files remain in SharePoint
- Full JSON-LD export capability
- No vendor lock-in

## Documentation

- [CLAUDE.md](CLAUDE.md) - Complete technical specification
- [W3C Web Annotation Data Model](https://www.w3.org/TR/annotation-model/)
- [W3C Web Annotation Protocol](https://www.w3.org/TR/annotation-protocol/)

## License

To be determined (Open core: AGPL or similar)
