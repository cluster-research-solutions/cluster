---
sidebar_position: 2
title: Tech Stack
---

# Tech Stack

Cluster is built with modern, well-supported technologies chosen for developer experience, performance, and long-term maintainability.

## Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18+ | UI framework |
| **TypeScript** | 5+ | Type safety |
| **Vite** | 5+ | Build tool and dev server |
| **TanStack Query** | 5+ | Server state management |
| **Zustand** | 4+ | Client state management |
| **Tailwind CSS** | 3+ | Utility-first styling |
| **Radix UI** | Latest | Accessible component primitives |
| **React Flow** | 11+ | Canvas/node visualization |
| **MSAL.js** | 3+ | Azure AD authentication |

### Key Libraries

#### TanStack Query
Manages all server state—API calls, caching, and synchronization:

```typescript
const { data: annotations } = useQuery({
  queryKey: ['annotations', studyId],
  queryFn: () => api.annotations.list({ studyId }),
});
```

#### Zustand
Minimal client state for UI concerns:

```typescript
const useCanvasStore = create((set) => ({
  selectedNodes: [],
  setSelectedNodes: (nodes) => set({ selectedNodes: nodes }),
}));
```

#### React Flow
Powers the clustering/affinity mapping canvas:

```typescript
<ReactFlow
  nodes={nodes}
  edges={edges}
  onNodesChange={onNodesChange}
  nodeTypes={nodeTypes}
/>
```

## Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | 20+ LTS | Runtime |
| **Express** | 4+ | HTTP framework |
| **TypeScript** | 5+ | Type safety |
| **Drizzle ORM** | Latest | Database access |
| **Zod** | 3+ | Request validation |
| **@azure/msal-node** | Latest | Azure AD authentication |
| **@microsoft/microsoft-graph-client** | Latest | SharePoint integration |

### Key Libraries

#### Drizzle ORM
Type-safe database access with excellent PostgreSQL support:

```typescript
const annotations = await db
  .select()
  .from(annotationsTable)
  .where(eq(annotationsTable.orgId, orgId))
  .orderBy(desc(annotationsTable.createdAt));
```

#### Zod
Request validation with TypeScript inference:

```typescript
const createAnnotationSchema = z.object({
  motivation: z.array(annotationMotivationSchema),
  targets: z.array(targetSchema),
  bodyText: z.string().optional(),
});

type CreateAnnotationInput = z.infer<typeof createAnnotationSchema>;
```

## Database

| Technology | Version | Purpose |
|------------|---------|---------|
| **PostgreSQL** | 15+ | Primary database |
| **Drizzle Kit** | Latest | Migrations |

### Why PostgreSQL?

- **JSONB support** — Store W3C JSON-LD annotations efficiently
- **GIN indexes** — Fast queries on JSONB fields
- **Array types** — Native support for motivation arrays
- **Mature ecosystem** — Excellent tooling and hosting options

### Schema Highlights

```sql
-- Annotations with W3C JSON-LD storage
CREATE TABLE annotations (
  id UUID PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES organizations(id),
  motivation annotation_motivation[] NOT NULL,
  jsonld JSONB NOT NULL,  -- Complete W3C annotation
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- GIN index for JSONB queries
CREATE INDEX idx_annotations_jsonld ON annotations USING GIN(jsonld);
```

## External Services

### Microsoft Graph API

Access SharePoint files using delegated permissions:

| Permission | Type | Purpose |
|------------|------|---------|
| `User.Read` | Delegated | Read user profile |
| `Files.Read.All` | Delegated | Read SharePoint files |
| `Sites.Read.All` | Delegated | List SharePoint sites |

### Azure Active Directory

OAuth 2.0 / OpenID Connect authentication:

- **Frontend**: MSAL.js popup/redirect flow
- **Backend**: Token validation and on-behalf-of flow

## Development Tools

| Tool | Purpose |
|------|---------|
| **pnpm** | Package manager (workspaces) |
| **tsx** | TypeScript execution |
| **Drizzle Studio** | Database GUI |
| **ESLint** | Code linting |
| **Prettier** | Code formatting |

## Optional Services

### Meilisearch
Full-text search across annotations:

```typescript
const results = await meilisearch.index('annotations').search(query, {
  filter: `orgId = "${orgId}"`,
  limit: 20,
});
```

### Redis
Session storage for multi-instance deployments:

```typescript
app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET,
}));
```

## Build Outputs

### Frontend
Static files served by any web server:

```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js
│   └── index-[hash].css
└── img/
```

### Backend
Node.js application:

```
dist/
├── index.js
├── routes/
├── services/
└── db/
```

## Docker Images

Official images available on GitHub Container Registry:

```bash
# API server
docker pull ghcr.io/cluster-research-solutions/cluster-api:latest

# Web frontend
docker pull ghcr.io/cluster-research-solutions/cluster-web:latest
```

## Next Steps

- [Data Model](/architecture/data-model) — Database schema details
- [Installation](/self-hosting/installation) — Deploy Cluster
