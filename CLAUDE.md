# Research Annotations Platform - Technical Specification

## Executive Summary

A W3C Web Annotation-compliant platform that enables UX research teams to annotate, tag, link, and synthesize research data (meeting recordings, transcripts, field notes, survey results) stored in organization-owned cloud storage (SharePoint), while maintaining complete data sovereignty and portability.

**Core Value Proposition**: Dovetail-level research synthesis capabilities with:
- Files staying in your cloud (SharePoint)
- Annotations in W3C standard format (portable, no lock-in)
- Annotation storage also org-controlled
- Open source core

---

## Key Decisions

| Decision | Choice |
|----------|--------|
| Source storage | SharePoint (M365 Business + Azure) |
| Annotation storage | Separate org-controlled PostgreSQL |
| Transcription (MVP) | Use existing meeting transcript files (.vtt) |
| Transcription (Post-MVP) | Whisper API, then pluggable connectors |
| AI features | Out of scope for MVP |
| License | Open core (AGPL or similar) |
| Deployment | Self-hosted first, SaaS later |
| Target users | Enterprise research teams + small teams |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              Client                                      │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │                     React SPA (Vite + TypeScript)                    ││
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ ││
│  │  │ File Browser│  │ Media Viewer│  │ Transcript  │  │  Synthesis  │ ││
│  │  │ (SharePoint)│  │ + Annotator │  │ Annotator   │  │    Board    │ ││
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘ ││
│  └─────────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ HTTPS
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           Backend Services                               │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │                     API Gateway (Node/Express + TypeScript)          ││
│  │                                                                      ││
│  │  /api/annotations/*     → W3C Protocol (CRUD, search, collections)  ││
│  │  /api/files/*           → SharePoint proxy (browse, stream, meta)   ││
│  │  /api/studies/*         → Research workflow (studies, insights)     ││
│  │  /api/auth/*            → Azure AD OAuth flow                       ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                    │                                     │
│                 ┌──────────────────┼──────────────────┐                 │
│                 ▼                  ▼                  ▼                 │
│  ┌─────────────────────┐  ┌─────────────────┐  ┌─────────────────────┐ │
│  │  Annotation Store   │  │  SharePoint     │  │  Search Index       │ │
│  │  (PostgreSQL)       │  │  Graph API      │  │  (Meilisearch)      │ │
│  └─────────────────────┘  └─────────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Frontend** | React + TypeScript + Vite | Fast, typed, broad ecosystem |
| **UI Components** | Radix UI + Tailwind | Accessible, customizable |
| **State** | Zustand + TanStack Query | Simple, performant |
| **Video Player** | Video.js or custom HTML5 | Extensible, handles streaming |
| **Canvas/Board** | React Flow or Excalidraw | Affinity mapping |
| **Backend** | Node.js + Express + TypeScript | Fast iteration, good MS SDK support |
| **Database** | PostgreSQL + Drizzle ORM | Relational for annotations, JSON support |
| **Search** | Meilisearch | Simple, fast, self-hostable |
| **Auth** | Azure AD via MSAL | Native M365 integration |
| **Deployment** | Docker Compose | Self-hosted simplicity |

---

## Project Structure

```
research-annotations/
├── README.md
├── LICENSE
├── docker-compose.yml
├── docker-compose.dev.yml
├── .env.example
│
├── packages/
│   ├── shared/                    # Shared types and utilities
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── types/
│   │       │   ├── annotation.ts      # W3C annotation types
│   │       │   ├── selector.ts        # Selector types
│   │       │   ├── research.ts        # Research extension types
│   │       │   └── index.ts
│   │       ├── schemas/
│   │       │   ├── annotation.schema.ts  # Zod schemas
│   │       │   └── index.ts
│   │       └── utils/
│   │           ├── jsonld.ts          # JSON-LD helpers
│   │           └── selectors.ts       # Selector utilities
│   │
│   ├── server/                    # Backend API
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── Dockerfile
│   │   └── src/
│   │       ├── index.ts
│   │       ├── config/
│   │       │   ├── env.ts
│   │       │   └── database.ts
│   │       ├── db/
│   │       │   ├── schema.ts          # Drizzle schema
│   │       │   ├── migrations/
│   │       │   └── seed.ts
│   │       ├── routes/
│   │       │   ├── auth.ts
│   │       │   ├── annotations.ts     # W3C Protocol endpoints
│   │       │   ├── files.ts           # SharePoint proxy
│   │       │   ├── studies.ts
│   │       │   ├── tags.ts
│   │       │   ├── insights.ts
│   │       │   └── index.ts
│   │       ├── services/
│   │       │   ├── sharepoint/
│   │       │   │   ├── client.ts      # Graph API client
│   │       │   │   ├── files.ts       # File operations
│   │       │   │   └── auth.ts        # Token management
│   │       │   ├── annotations/
│   │       │   │   ├── service.ts
│   │       │   │   ├── selectors.ts   # Selector handling
│   │       │   │   └── export.ts      # W3C JSON-LD export
│   │       │   ├── search/
│   │       │   │   └── meilisearch.ts
│   │       │   └── transcripts/
│   │       │       ├── parser.ts      # VTT/SRT parsing
│   │       │       └── aligner.ts     # Time alignment
│   │       ├── middleware/
│   │       │   ├── auth.ts
│   │       │   ├── org.ts             # Org context
│   │       │   └── errors.ts
│   │       └── utils/
│   │           └── graph.ts           # MS Graph helpers
│   │
│   └── web/                       # Frontend SPA
│       ├── package.json
│       ├── tsconfig.json
│       ├── vite.config.ts
│       ├── Dockerfile
│       ├── index.html
│       └── src/
│           ├── main.tsx
│           ├── App.tsx
│           ├── api/
│           │   ├── client.ts          # API client
│           │   ├── annotations.ts
│           │   ├── files.ts
│           │   └── hooks/             # TanStack Query hooks
│           ├── components/
│           │   ├── ui/                # Base UI components
│           │   ├── file-browser/
│           │   ├── media-viewer/
│           │   ├── transcript/
│           │   ├── annotations/
│           │   ├── synthesis/
│           │   ├── insights/
│           │   └── layout/
│           ├── pages/
│           ├── stores/
│           ├── hooks/
│           ├── lib/
│           │   ├── selectors/
│           │   └── msal.ts
│           └── styles/
│
├── docs/
│   ├── architecture.md
│   ├── data-model.md
│   ├── api.md
│   └── deployment.md
│
└── scripts/
    ├── setup-azure.sh
    └── dev.sh
```

---

## W3C Web Annotation Data Model

### Core Concepts

The W3C Web Annotation Data Model (February 2017 Recommendation) defines:

- **Annotation**: A connection between a Body and a Target
- **Body**: The content of the annotation (comment, tag, etc.)
- **Target**: The resource being annotated
- **Selector**: A mechanism to identify a segment of the target
- **Motivation**: The intent behind the annotation

### Selector Types for This Project

| Selector | Use Case | Example |
|----------|----------|---------|
| `TextQuoteSelector` | Text in transcripts/docs | `{"exact": "quote", "prefix": "...", "suffix": "..."}` |
| `TextPositionSelector` | Fallback for text | `{"start": 100, "end": 150}` |
| `FragmentSelector` | Video/audio time ranges | `{"value": "t=30,45", "conformsTo": "http://www.w3.org/TR/media-frags/"}` |

### Research-Specific Extensions

Custom vocabulary at `https://research-annotations.io/ns/research.jsonld`:

```json
{
  "@context": {
    "research": "https://research-annotations.io/ns/research#",
    
    "Study": "research:Study",
    "Insight": "research:Insight",
    "AffinityGroup": "research:AffinityGroup",
    
    "study": {"@id": "research:study", "@type": "@id"},
    "participant": "research:participant",
    "session": "research:session",
    "confidence": "research:confidence",
    "impact": "research:impact",
    "recommendation": "research:recommendation"
  }
}
```

### Example Annotations

#### Basic Highlight
```json
{
  "@context": [
    "http://www.w3.org/ns/anno.jsonld",
    "https://research-annotations.io/ns/research.jsonld"
  ],
  "id": "urn:uuid:a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "type": "Annotation",
  "motivation": "highlighting",
  "creator": {
    "id": "https://org.sharepoint.com/users/jsmith",
    "type": "Person",
    "name": "Jane Smith"
  },
  "created": "2025-01-03T14:30:00Z",
  "target": {
    "source": "https://org.sharepoint.com/sites/research/interviews/p05-session.mp4",
    "selector": {
      "type": "FragmentSelector",
      "conformsTo": "http://www.w3.org/TR/media-frags/",
      "value": "t=324.5,358.2"
    }
  },
  "research:study": "https://org.sharepoint.com/sites/research/studies/onboarding-2025",
  "research:participant": "P05"
}
```

#### Tagged Highlight
```json
{
  "@context": [
    "http://www.w3.org/ns/anno.jsonld",
    "https://research-annotations.io/ns/research.jsonld"
  ],
  "id": "urn:uuid:b2c3d4e5-f6a7-8901-bcde-f23456789012",
  "type": "Annotation",
  "motivation": ["highlighting", "tagging"],
  "body": [
    {
      "type": "SpecificResource",
      "source": "https://org.sharepoint.com/sites/research/taxonomies/main.jsonld#pain-point",
      "purpose": "tagging"
    }
  ],
  "target": {
    "source": "https://org.sharepoint.com/sites/research/interviews/p05-transcript.txt",
    "selector": [
      {
        "type": "TextQuoteSelector",
        "exact": "I had no idea what to do after I created my account.",
        "prefix": "the signup was fine but ",
        "suffix": " I ended up just closing"
      },
      {
        "type": "TextPositionSelector",
        "start": 2847,
        "end": 2934
      }
    ]
  },
  "research:study": "https://org.sharepoint.com/sites/research/studies/onboarding-2025",
  "research:participant": "P05"
}
```

#### Cross-Document Link
```json
{
  "@context": [
    "http://www.w3.org/ns/anno.jsonld",
    "https://research-annotations.io/ns/research.jsonld"
  ],
  "id": "urn:uuid:c3d4e5f6-a7b8-9012-cdef-345678901234",
  "type": "Annotation",
  "motivation": "linking",
  "body": {
    "type": "TextualBody",
    "value": "Same confusion pattern observed across 4 participants",
    "purpose": "describing"
  },
  "target": [
    {
      "source": "https://org.sharepoint.com/sites/research/interviews/p05-transcript.txt",
      "selector": { "type": "TextQuoteSelector", "exact": "I had no idea what to do" }
    },
    {
      "source": "https://org.sharepoint.com/sites/research/interviews/p03-transcript.txt",
      "selector": { "type": "TextQuoteSelector", "exact": "the next step wasn't clear" }
    }
  ]
}
```

#### Insight (Evidence-Backed Claim)
```json
{
  "@context": [
    "http://www.w3.org/ns/anno.jsonld",
    "https://research-annotations.io/ns/research.jsonld"
  ],
  "id": "urn:uuid:d4e5f6a7-b8c9-0123-def0-456789012345",
  "type": ["Annotation", "research:Insight"],
  "motivation": "describing",
  "body": {
    "type": "TextualBody",
    "value": "Users experience a critical moment of confusion immediately after account creation.",
    "format": "text/markdown",
    "purpose": "describing"
  },
  "target": [
    "urn:uuid:c3d4e5f6-a7b8-9012-cdef-345678901234",
    "urn:uuid:b2c3d4e5-f6a7-8901-bcde-f23456789012"
  ],
  "research:confidence": "high",
  "research:impact": "critical",
  "research:recommendation": "Add onboarding checklist to post-signup dashboard"
}
```

---

## Database Schema

```sql
-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Enums
CREATE TYPE annotation_motivation AS ENUM (
  'highlighting', 'tagging', 'classifying', 'commenting', 
  'describing', 'linking', 'questioning', 'bookmarking'
);

CREATE TYPE selector_type AS ENUM (
  'TextQuoteSelector', 'TextPositionSelector', 'FragmentSelector',
  'CssSelector', 'XPathSelector', 'RangeSelector'
);

-- Organizations (tenants)
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  azure_tenant_id VARCHAR(255) UNIQUE NOT NULL,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users (synced from Azure AD)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  azure_user_id VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  display_name VARCHAR(255),
  avatar_url VARCHAR(500),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(org_id, azure_user_id)
);

-- Studies (research projects)
CREATE TABLE studies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'active',
  sharepoint_folder_url VARCHAR(1000),
  settings JSONB DEFAULT '{}',
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- File references (cached metadata from SharePoint)
CREATE TABLE file_refs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  study_id UUID REFERENCES studies(id) ON DELETE SET NULL,
  
  -- SharePoint identifiers
  sharepoint_drive_id VARCHAR(255) NOT NULL,
  sharepoint_item_id VARCHAR(255) NOT NULL,
  sharepoint_site_id VARCHAR(255),
  
  -- Cached metadata
  name VARCHAR(500) NOT NULL,
  mime_type VARCHAR(100),
  size_bytes BIGINT,
  web_url VARCHAR(1000),
  
  -- Content verification
  content_hash VARCHAR(64),
  last_synced_at TIMESTAMPTZ,
  
  -- Transcript association
  transcript_file_id UUID REFERENCES file_refs(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(org_id, sharepoint_drive_id, sharepoint_item_id)
);

-- Taxonomies (tag hierarchies)
CREATE TABLE taxonomies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  study_id UUID REFERENCES studies(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  is_global BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tags (within taxonomies)
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  taxonomy_id UUID REFERENCES taxonomies(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES tags(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  color VARCHAR(7),
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(taxonomy_id, slug)
);

-- Annotations (W3C compliant core)
CREATE TABLE annotations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  study_id UUID REFERENCES studies(id) ON DELETE SET NULL,
  
  -- W3C required fields
  motivation annotation_motivation[] NOT NULL DEFAULT '{highlighting}',
  
  -- Creator info
  creator_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  modified_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Research metadata
  participant_id VARCHAR(100),
  session_id VARCHAR(100),
  
  -- Full W3C JSON-LD
  jsonld JSONB NOT NULL,
  
  -- Denormalized for querying
  body_text TEXT,
  
  -- Soft delete
  deleted_at TIMESTAMPTZ
);

-- Annotation targets
CREATE TABLE annotation_targets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  annotation_id UUID REFERENCES annotations(id) ON DELETE CASCADE,
  file_ref_id UUID REFERENCES file_refs(id) ON DELETE CASCADE,
  
  -- Selector data
  selector_type selector_type NOT NULL,
  selector_value JSONB NOT NULL,
  
  -- Denormalized for display
  exact_text TEXT,
  start_time DECIMAL(10,3),
  end_time DECIMAL(10,3),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Annotation tags (many-to-many)
CREATE TABLE annotation_tags (
  annotation_id UUID REFERENCES annotations(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (annotation_id, tag_id)
);

-- Insights (evidence-backed claims)
CREATE TABLE insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  study_id UUID REFERENCES studies(id) ON DELETE SET NULL,
  
  title VARCHAR(500) NOT NULL,
  body_markdown TEXT,
  
  confidence VARCHAR(50),
  impact VARCHAR(50),
  recommendation TEXT,
  
  creator_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  jsonld JSONB
);

-- Evidence links
CREATE TABLE insight_evidence (
  insight_id UUID REFERENCES insights(id) ON DELETE CASCADE,
  annotation_id UUID REFERENCES annotations(id) ON DELETE CASCADE,
  sort_order INTEGER DEFAULT 0,
  note TEXT,
  PRIMARY KEY (insight_id, annotation_id)
);

-- Affinity groups
CREATE TABLE affinity_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  study_id UUID REFERENCES studies(id) ON DELETE CASCADE,
  board_id UUID,
  
  name VARCHAR(255) NOT NULL,
  color VARCHAR(7),
  
  position_x DECIMAL(10,2),
  position_y DECIMAL(10,2),
  width DECIMAL(10,2),
  height DECIMAL(10,2),
  
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Affinity group items
CREATE TABLE affinity_group_items (
  affinity_group_id UUID REFERENCES affinity_groups(id) ON DELETE CASCADE,
  annotation_id UUID REFERENCES annotations(id) ON DELETE CASCADE,
  position_x DECIMAL(10,2),
  position_y DECIMAL(10,2),
  sort_order INTEGER DEFAULT 0,
  PRIMARY KEY (affinity_group_id, annotation_id)
);

-- Indexes
CREATE INDEX idx_annotations_org ON annotations(org_id);
CREATE INDEX idx_annotations_study ON annotations(study_id);
CREATE INDEX idx_annotations_creator ON annotations(creator_id);
CREATE INDEX idx_annotations_created ON annotations(created_at);
CREATE INDEX idx_annotations_motivation ON annotations USING GIN(motivation);
CREATE INDEX idx_annotations_jsonld ON annotations USING GIN(jsonld);
CREATE INDEX idx_annotation_targets_file ON annotation_targets(file_ref_id);
CREATE INDEX idx_file_refs_sharepoint ON file_refs(sharepoint_drive_id, sharepoint_item_id);
CREATE INDEX idx_tags_taxonomy ON tags(taxonomy_id);
CREATE INDEX idx_insights_study ON insights(study_id);
```

---

## Azure AD Configuration

### Required App Permissions

| Permission | Type | Purpose |
|------------|------|---------|
| `User.Read` | Delegated | Read signed-in user profile |
| `Files.Read.All` | Delegated | Read files in SharePoint/OneDrive |
| `Sites.Read.All` | Delegated | List SharePoint sites |

### Environment Variables

```bash
# Azure AD
AZURE_TENANT_ID=your-tenant-id
AZURE_CLIENT_ID=your-client-id
AZURE_CLIENT_SECRET=your-client-secret

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/research_annotations

# Search
MEILISEARCH_URL=http://localhost:7700
MEILISEARCH_API_KEY=your-master-key

# App
API_URL=http://localhost:4000
WEB_URL=http://localhost:3000
SESSION_SECRET=your-session-secret
```

---

## MVP Feature Checklist

### Phase 1: Core Infrastructure (Weeks 1-2)
- [ ] Project scaffolding (monorepo, shared types)
- [ ] Azure AD app registration
- [ ] Auth flow (MSAL login → token → Graph API)
- [ ] Database schema + migrations
- [ ] Basic API routes (health, auth status)
- [ ] Docker Compose setup

### Phase 2: File Browsing (Weeks 3-4)
- [ ] SharePoint connector (list sites, drives, files)
- [ ] File browser UI (tree view + preview)
- [ ] File metadata caching
- [ ] Video streaming proxy
- [ ] Transcript file detection + parsing (VTT)

### Phase 3: Annotation Core (Weeks 5-6)
- [ ] Annotation CRUD API (W3C Protocol)
- [ ] Text selection hook
- [ ] Highlight creation UI
- [ ] Tag system (taxonomies, tags)
- [ ] Tag picker component
- [ ] Annotation list/sidebar

### Phase 4: Media + Transcript (Weeks 7-8)
- [ ] Video player with timeline
- [ ] Transcript view with speaker labels
- [ ] Time-synced scrolling
- [ ] Click-to-seek in transcript
- [ ] Video clip creation from highlights
- [ ] Fragment selector support

### Phase 5: Synthesis (Weeks 9-10)
- [ ] Study management (create, configure)
- [ ] Cross-file annotation browsing
- [ ] Basic affinity board (drag clips into groups)
- [ ] Insight creation (evidence linking)
- [ ] Simple report view

### Phase 6: Polish + Export (Weeks 11-12)
- [ ] Full W3C JSON-LD export
- [ ] Search (full-text + tags)
- [ ] Annotation resolution/anchoring
- [ ] Error handling + loading states
- [ ] Documentation
- [ ] Deployment guide

---

## Key Implementation Notes

### SharePoint Graph API
- Use `@microsoft/microsoft-graph-client` with `@azure/identity`
- On-behalf-of flow for delegated permissions
- Key endpoints: `/sites`, `/drives/{id}/items`, `/drives/{id}/items/{id}/content`

### Transcript Parsing
- Teams meeting transcripts are `.vtt` (WebVTT format)
- Parse with regex: timestamp line → text lines → speaker extraction
- Format: `"Speaker Name: text content"`

### Text Selection
- Use `window.getSelection()` and `Range` API
- Build both TextQuoteSelector (resilient) and TextPositionSelector (fallback)
- Extract prefix/suffix for quote context (50 chars each)

### Video Time Sync
- Map transcript cues to video timestamps
- Sync transcript scroll to video currentTime
- Click transcript line → seek video to cue.startTime

### W3C JSON-LD Export
- Always include both contexts: W3C anno + research extension
- Use `urn:uuid:` for annotation IDs
- Store full JSON-LD in `jsonld` column for easy export

---

## Docker Compose

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: research
      POSTGRES_PASSWORD: ${DB_PASSWORD:-devpassword}
      POSTGRES_DB: research_annotations
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  meilisearch:
    image: getmeili/meilisearch:v1.5
    environment:
      MEILI_MASTER_KEY: ${MEILI_MASTER_KEY:-devmasterkey}
    volumes:
      - meilisearch_data:/meili_data
    ports:
      - "7700:7700"

  api:
    build:
      context: .
      dockerfile: packages/server/Dockerfile
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://research:${DB_PASSWORD:-devpassword}@postgres:5432/research_annotations
      MEILISEARCH_URL: http://meilisearch:7700
      MEILISEARCH_API_KEY: ${MEILI_MASTER_KEY:-devmasterkey}
      AZURE_TENANT_ID: ${AZURE_TENANT_ID}
      AZURE_CLIENT_ID: ${AZURE_CLIENT_ID}
      AZURE_CLIENT_SECRET: ${AZURE_CLIENT_SECRET}
    ports:
      - "4000:4000"
    depends_on:
      - postgres
      - meilisearch

  web:
    build:
      context: .
      dockerfile: packages/web/Dockerfile
    environment:
      VITE_API_URL: ${API_URL:-http://localhost:4000}
      VITE_AZURE_CLIENT_ID: ${AZURE_CLIENT_ID}
      VITE_AZURE_TENANT_ID: ${AZURE_TENANT_ID}
    ports:
      - "3000:3000"
    depends_on:
      - api

volumes:
  postgres_data:
  meilisearch_data:
```

---

## Getting Started (First Steps)

1. **Create project directory and initialize monorepo**
2. **Set up Azure AD app registration** (get client ID, secret, tenant ID)
3. **Create packages/shared with TypeScript types**
4. **Create packages/server with Express + Drizzle**
5. **Create packages/web with Vite + React**
6. **Implement auth flow as proof of concept**
7. **Test SharePoint file listing**

---

## References

- [W3C Web Annotation Data Model](https://www.w3.org/TR/annotation-model/)
- [W3C Web Annotation Protocol](https://www.w3.org/TR/annotation-protocol/)
- [W3C Web Annotation Vocabulary](https://www.w3.org/TR/annotation-vocab/)
- [Media Fragments URI](https://www.w3.org/TR/media-frags/)
- [Microsoft Graph API - Files](https://learn.microsoft.com/en-us/graph/api/resources/driveitem)
- [MSAL.js for React](https://github.com/AzureAD/microsoft-authentication-library-for-js)
