---
sidebar_position: 6
title: Studies
---

# Studies API

Studies are research projects that group files, annotations, and insights. They provide context for analysis and enable team collaboration.

## Overview

A study contains:
- **Files** — SharePoint file references
- **Annotations** — Highlights, tags, comments on files
- **Clusters** — Grouped annotations (affinity mapping)
- **Insights** — Evidence-backed findings
- **Tags** — Study-specific taxonomy

## Endpoints

### List Studies

```http
GET /api/studies
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | string | Filter by status (`active`, `archived`, `draft`) |
| `search` | string | Search study names/descriptions |
| `offset` | integer | Pagination offset |
| `limit` | integer | Results per page |

**Response:**

```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Onboarding Research Q1 2025",
      "description": "Understanding new user experience in first 7 days",
      "status": "active",
      "sharepointFolderUrl": "https://company.sharepoint.com/sites/research/Onboarding-2025",
      "createdBy": {
        "id": "user-id",
        "name": "Jane Smith"
      },
      "createdAt": "2025-01-01T00:00:00Z",
      "updatedAt": "2025-01-03T14:30:00Z",
      "stats": {
        "fileCount": 12,
        "annotationCount": 247,
        "insightCount": 8
      }
    }
  ],
  "meta": {
    "total": 15,
    "offset": 0,
    "limit": 20
  }
}
```

### Get Study

```http
GET /api/studies/:id
```

**Response:**

```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Onboarding Research Q1 2025",
    "description": "Understanding new user experience in first 7 days",
    "status": "active",
    "sharepointFolderUrl": "https://company.sharepoint.com/sites/research/Onboarding-2025",
    "settings": {
      "defaultTaxonomyId": "taxonomy-uuid",
      "participantPrefix": "P",
      "requireTags": false
    },
    "createdBy": {
      "id": "user-id",
      "name": "Jane Smith",
      "email": "jsmith@company.com"
    },
    "createdAt": "2025-01-01T00:00:00Z",
    "updatedAt": "2025-01-03T14:30:00Z"
  }
}
```

### Create Study

```http
POST /api/studies
Content-Type: application/json
```

**Request:**

```json
{
  "name": "Checkout Flow Research",
  "description": "Investigating cart abandonment and checkout friction",
  "sharepointFolderUrl": "https://company.sharepoint.com/sites/research/Checkout-2025",
  "settings": {
    "participantPrefix": "P",
    "requireTags": true
  }
}
```

**Response:**

```http
HTTP/1.1 201 Created
Location: /api/studies/660e8400-e29b-41d4-a716-446655440000
```

```json
{
  "data": {
    "id": "660e8400-e29b-41d4-a716-446655440000",
    "name": "Checkout Flow Research",
    "description": "Investigating cart abandonment and checkout friction",
    "status": "active",
    "sharepointFolderUrl": "https://company.sharepoint.com/sites/research/Checkout-2025",
    "createdAt": "2025-01-03T15:00:00Z"
  }
}
```

### Update Study

```http
PATCH /api/studies/:id
Content-Type: application/json
```

**Request:**

```json
{
  "name": "Checkout Flow Research Q1",
  "status": "active",
  "settings": {
    "requireTags": true
  }
}
```

### Archive Study

```http
POST /api/studies/:id/archive
```

**Response:**

```json
{
  "data": {
    "id": "...",
    "status": "archived",
    "archivedAt": "2025-03-01T00:00:00Z"
  }
}
```

### Delete Study

```http
DELETE /api/studies/:id
```

:::caution
Deleting a study removes all associated annotations, clusters, and insights. This cannot be undone.
:::

**Response:**

```http
HTTP/1.1 204 No Content
```

## Study Files

### List Study Files

```http
GET /api/studies/:id/files
```

**Response:**

```json
{
  "data": [
    {
      "id": "file-ref-uuid",
      "name": "P01-Interview.mp4",
      "mimeType": "video/mp4",
      "size": 524288000,
      "webUrl": "https://company.sharepoint.com/...",
      "participantId": "P01",
      "annotationCount": 34,
      "lastAnnotatedAt": "2025-01-03T14:00:00Z"
    }
  ]
}
```

### Add File to Study

```http
POST /api/studies/:id/files
```

**Request:**

```json
{
  "driveId": "drive-id",
  "itemId": "item-id",
  "participantId": "P01"
}
```

### Remove File from Study

```http
DELETE /api/studies/:id/files/:fileId
```

:::note
This removes the file reference. Annotations on this file within the study remain but are orphaned.
:::

## Study Annotations

### Get Study Annotations

```http
GET /api/studies/:id/annotations
```

See [Annotations API](/api/annotations) for query parameters.

### Get Annotation Stats

```http
GET /api/studies/:id/stats/annotations
```

**Response:**

```json
{
  "data": {
    "total": 247,
    "byMotivation": {
      "highlighting": 180,
      "tagging": 200,
      "commenting": 45,
      "linking": 12
    },
    "byParticipant": {
      "P01": 42,
      "P02": 38,
      "P03": 55
    },
    "byTag": [
      { "tag": "Pain Point", "count": 78 },
      { "tag": "Delight", "count": 23 },
      { "tag": "Confusion", "count": 45 }
    ],
    "byCreator": [
      { "user": "Jane Smith", "count": 120 },
      { "user": "John Doe", "count": 127 }
    ],
    "timeline": [
      { "date": "2025-01-01", "count": 45 },
      { "date": "2025-01-02", "count": 82 },
      { "date": "2025-01-03", "count": 120 }
    ]
  }
}
```

## Study Tags

### Get Study Taxonomy

```http
GET /api/studies/:id/taxonomy
```

**Response:**

```json
{
  "data": {
    "id": "taxonomy-uuid",
    "name": "Default Research Tags",
    "tags": [
      {
        "id": "tag-1",
        "name": "Pain Point",
        "slug": "pain-point",
        "color": "#e74c3c",
        "children": []
      },
      {
        "id": "tag-2",
        "name": "Experience",
        "slug": "experience",
        "color": "#3498db",
        "children": [
          {
            "id": "tag-2a",
            "name": "Positive",
            "slug": "experience-positive",
            "color": "#2ecc71"
          },
          {
            "id": "tag-2b",
            "name": "Negative",
            "slug": "experience-negative",
            "color": "#e74c3c"
          }
        ]
      }
    ]
  }
}
```

### Create Tag

```http
POST /api/studies/:id/tags
```

**Request:**

```json
{
  "name": "New Feature Request",
  "color": "#9b59b6",
  "parentId": null
}
```

## Study Clusters

### List Clusters

```http
GET /api/studies/:id/clusters
```

See [Clusters API](/api/clusters) for details.

## Study Insights

### List Insights

```http
GET /api/studies/:id/insights
```

**Response:**

```json
{
  "data": [
    {
      "id": "insight-uuid",
      "title": "Onboarding checklist is critical",
      "body": "4 of 6 participants expressed confusion about next steps after account creation.",
      "confidence": "high",
      "impact": "critical",
      "recommendation": "Add prominent onboarding checklist to post-signup dashboard",
      "evidenceCount": 4,
      "createdBy": {
        "name": "Jane Smith"
      },
      "createdAt": "2025-01-03T16:00:00Z"
    }
  ]
}
```

### Create Insight

```http
POST /api/studies/:id/insights
```

**Request:**

```json
{
  "title": "Users struggle with navigation",
  "body": "Markdown content describing the insight...",
  "confidence": "medium",
  "impact": "high",
  "recommendation": "Simplify the main navigation",
  "evidence": [
    "annotation-uuid-1",
    "annotation-uuid-2"
  ]
}
```

## Study Export

### Export Full Study

```http
GET /api/studies/:id/export
Accept: application/ld+json
```

See [W3C Export API](/api/w3c-export) for format details.

### Export Report

```http
GET /api/studies/:id/report
Accept: text/markdown
```

**Response:**

```markdown
# Onboarding Research Q1 2025

## Overview
Understanding new user experience in first 7 days

## Key Insights

### 1. Onboarding checklist is critical
**Confidence:** High | **Impact:** Critical

4 of 6 participants expressed confusion about next steps after account creation.

**Evidence:**
- P01: "I had no idea what to do next"
- P03: "The next step wasn't clear"
...

## Recommendations
1. Add prominent onboarding checklist to post-signup dashboard
...
```

## Collaboration

### Study Members

```http
GET /api/studies/:id/members
```

**Response:**

```json
{
  "data": [
    {
      "userId": "user-uuid",
      "name": "Jane Smith",
      "email": "jsmith@company.com",
      "role": "owner",
      "joinedAt": "2025-01-01T00:00:00Z"
    },
    {
      "userId": "user-uuid-2",
      "name": "John Doe",
      "email": "jdoe@company.com",
      "role": "contributor",
      "joinedAt": "2025-01-02T00:00:00Z"
    }
  ]
}
```

### Add Member

```http
POST /api/studies/:id/members
```

**Request:**

```json
{
  "email": "newuser@company.com",
  "role": "contributor"
}
```

## Next Steps

- [Clusters API](/api/clusters) — Organize annotations into groups
- [W3C Export](/api/w3c-export) — Export study data
