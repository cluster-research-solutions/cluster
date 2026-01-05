---
sidebar_position: 3
title: Data Model
---

# Data Model

Cluster's database schema is designed around the W3C Web Annotation Data Model while supporting multi-tenant organization isolation and research-specific workflows.

## Entity Relationship Diagram

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│ organizations│◄──────│    users     │       │   studies    │
└──────────────┘       └──────────────┘       └──────────────┘
       │                      │                      │
       │                      │                      │
       ▼                      ▼                      ▼
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│  annotations │◄──────│annotation_   │──────▶│  file_refs   │
│              │       │   targets    │       │              │
└──────────────┘       └──────────────┘       └──────────────┘
       │                                             │
       │                                             │
       ▼                                             ▼
┌──────────────┐       ┌──────────────┐       SharePoint/
│   clusters   │       │    tags      │       Google Drive
│(affinity_    │       │              │
│  groups)     │       └──────────────┘
└──────────────┘
```

## Core Tables

### organizations

Multi-tenant isolation. Each Azure AD tenant maps to one organization.

```sql
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  azure_tenant_id VARCHAR(255) NOT NULL UNIQUE,
  settings JSONB DEFAULT '{}' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
```

### users

Synced from Azure AD on first login.

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  azure_user_id VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  display_name VARCHAR(255),
  avatar_url VARCHAR(500),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(org_id, azure_user_id)
);
```

### annotations

The core entity. Stores W3C-compliant annotations.

```sql
CREATE TABLE annotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  study_id UUID REFERENCES studies(id) ON DELETE SET NULL,

  -- W3C motivation(s)
  motivation annotation_motivation[] NOT NULL,

  -- Creator reference
  creator_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  modified_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Research metadata
  participant_id VARCHAR(100),
  session_id VARCHAR(100),

  -- Complete W3C JSON-LD
  jsonld JSONB NOT NULL,

  -- Denormalized for queries
  body_text TEXT,

  -- Soft delete
  deleted_at TIMESTAMPTZ
);
```

**Key points:**
- `jsonld` contains the complete W3C annotation for export
- `motivation` array enables efficient filtering
- `body_text` denormalized for full-text search
- Soft delete preserves annotation history

### annotation_targets

Links annotations to their targets (files/documents).

```sql
CREATE TABLE annotation_targets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  annotation_id UUID NOT NULL REFERENCES annotations(id) ON DELETE CASCADE,
  file_ref_id UUID NOT NULL REFERENCES file_refs(id) ON DELETE CASCADE,

  -- Selector type and data
  selector_type selector_type NOT NULL,
  selector_value JSONB NOT NULL,

  -- Denormalized for display
  exact_text TEXT,
  start_time DECIMAL(10,3),
  end_time DECIMAL(10,3),

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
```

**Selector types:**
- `TextQuoteSelector` — Text with prefix/suffix context
- `TextPositionSelector` — Character offsets
- `FragmentSelector` — Media time ranges (t=start,end)
- `RangeSelector` — Complex ranges

### file_refs

Cached metadata for external files. Files stay in SharePoint/Drive.

```sql
CREATE TABLE file_refs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
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

  -- Change detection
  content_hash VARCHAR(64),
  last_synced_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  UNIQUE(org_id, sharepoint_drive_id, sharepoint_item_id)
);
```

### affinity_groups (Clusters)

Groups of related annotations for synthesis.

```sql
CREATE TABLE affinity_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  study_id UUID REFERENCES studies(id) ON DELETE CASCADE,

  name VARCHAR(255) NOT NULL,
  color VARCHAR(7),  -- Hex color

  -- Canvas position
  position_x DECIMAL(10,2),
  position_y DECIMAL(10,2),
  width DECIMAL(10,2),
  height DECIMAL(10,2),

  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE affinity_group_items (
  affinity_group_id UUID REFERENCES affinity_groups(id) ON DELETE CASCADE,
  annotation_id UUID REFERENCES annotations(id) ON DELETE CASCADE,
  position_x DECIMAL(10,2),
  position_y DECIMAL(10,2),
  sort_order INTEGER DEFAULT 0,
  PRIMARY KEY (affinity_group_id, annotation_id)
);
```

### tags

Hierarchical taxonomy for categorizing annotations.

```sql
CREATE TABLE taxonomies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  study_id UUID REFERENCES studies(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  is_global BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  taxonomy_id UUID NOT NULL REFERENCES taxonomies(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES tags(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  color VARCHAR(7),
  sort_order INTEGER DEFAULT 0,
  UNIQUE(taxonomy_id, slug)
);

CREATE TABLE annotation_tags (
  annotation_id UUID REFERENCES annotations(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (annotation_id, tag_id)
);
```

## Indexing Strategy

```sql
-- Filter by organization (multi-tenant)
CREATE INDEX idx_annotations_org ON annotations(org_id);

-- Filter by study
CREATE INDEX idx_annotations_study ON annotations(study_id);

-- Time-based queries
CREATE INDEX idx_annotations_created ON annotations(created_at);

-- JSONB queries
CREATE INDEX idx_annotations_jsonld ON annotations USING GIN(jsonld);

-- File lookups
CREATE INDEX idx_annotation_targets_file ON annotation_targets(file_ref_id);
CREATE INDEX idx_file_refs_sharepoint ON file_refs(sharepoint_drive_id, sharepoint_item_id);
```

## W3C JSON-LD Storage

The `jsonld` column stores complete W3C annotations:

```json
{
  "@context": [
    "http://www.w3.org/ns/anno.jsonld",
    "https://cluster.app/ns/research.jsonld"
  ],
  "id": "urn:uuid:550e8400-e29b-41d4-a716-446655440000",
  "type": "Annotation",
  "motivation": ["highlighting", "tagging"],
  "creator": {
    "id": "urn:uuid:user-id",
    "type": "Person",
    "name": "Jane Smith"
  },
  "created": "2025-01-04T10:30:00Z",
  "target": {
    "source": "https://sharepoint.com/sites/research/interview.vtt",
    "selector": {
      "type": "TextQuoteSelector",
      "exact": "I had no idea what to do",
      "prefix": "the signup was fine but ",
      "suffix": " I ended up just closing"
    }
  },
  "research:study": "urn:uuid:study-id",
  "research:participant": "P05"
}
```

## Next Steps

- [W3C Export API](/api/w3c-export) — Export annotations in standard format
- [Self-Hosting](/self-hosting/requirements) — Deploy with this schema
