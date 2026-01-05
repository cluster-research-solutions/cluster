---
sidebar_position: 4
title: W3C Export
---

# W3C Export API

Export annotations in W3C Web Annotation format for interoperability and data portability.

## Overview

Cluster stores annotations in W3C Web Annotation format internally. The Export API provides:

- **Complete JSON-LD** — Valid W3C Web Annotation documents
- **Annotation Collections** — Groups of related annotations
- **Annotation Pages** — Paginated annotation lists
- **Research Extensions** — Optional Cluster-specific metadata

## Export Formats

### Single Annotation

```http
GET /api/annotations/:id/export
Accept: application/ld+json; profile="http://www.w3.org/ns/anno.jsonld"
```

**Response:**

```json
{
  "@context": [
    "http://www.w3.org/ns/anno.jsonld",
    "https://cluster.research/ns/research.jsonld"
  ],
  "id": "urn:uuid:a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "type": "Annotation",
  "motivation": ["highlighting", "tagging"],
  "created": "2025-01-03T14:30:00Z",
  "modified": "2025-01-03T15:00:00Z",
  "creator": {
    "id": "https://company.sharepoint.com/users/jsmith",
    "type": "Person",
    "name": "Jane Smith",
    "email": "jsmith@company.com"
  },
  "generator": {
    "id": "https://cluster.research",
    "type": "Software",
    "name": "Cluster",
    "homepage": "https://github.com/cluster-research-solutions/cluster"
  },
  "body": [
    {
      "type": "SpecificResource",
      "source": "https://cluster.research/taxonomies/main#pain-point",
      "purpose": "tagging"
    }
  ],
  "target": {
    "source": "https://company.sharepoint.com/sites/research/interviews/p05-transcript.txt",
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
  "research:study": "urn:uuid:study-id",
  "research:participant": "P05"
}
```

### Annotation Collection

Export a study's annotations as a W3C Annotation Collection:

```http
GET /api/studies/:id/export
Accept: application/ld+json; profile="http://www.w3.org/ns/anno.jsonld"
```

**Response:**

```json
{
  "@context": "http://www.w3.org/ns/anno.jsonld",
  "id": "https://cluster.yourcompany.com/api/studies/uuid/export",
  "type": "AnnotationCollection",
  "label": "Onboarding Research Study 2025",
  "total": 247,
  "first": {
    "id": "https://cluster.yourcompany.com/api/studies/uuid/export?page=0",
    "type": "AnnotationPage",
    "startIndex": 0,
    "items": [
      { ... },
      { ... }
    ]
  },
  "last": "https://cluster.yourcompany.com/api/studies/uuid/export?page=12"
}
```

### Annotation Page

Paginated annotation results:

```http
GET /api/studies/:id/export?page=2
```

**Response:**

```json
{
  "@context": "http://www.w3.org/ns/anno.jsonld",
  "id": "https://cluster.yourcompany.com/api/studies/uuid/export?page=2",
  "type": "AnnotationPage",
  "partOf": {
    "id": "https://cluster.yourcompany.com/api/studies/uuid/export",
    "total": 247
  },
  "startIndex": 40,
  "next": "https://cluster.yourcompany.com/api/studies/uuid/export?page=3",
  "prev": "https://cluster.yourcompany.com/api/studies/uuid/export?page=1",
  "items": [
    { ... },
    { ... }
  ]
}
```

## Cluster Export

Export a cluster (affinity group) as an Annotation Collection:

```http
GET /api/clusters/:id/export
Accept: application/ld+json; profile="http://www.w3.org/ns/anno.jsonld"
```

**Response:**

```json
{
  "@context": [
    "http://www.w3.org/ns/anno.jsonld",
    "https://cluster.research/ns/research.jsonld"
  ],
  "id": "urn:uuid:cluster-id",
  "type": ["AnnotationCollection", "research:AffinityGroup"],
  "label": "Onboarding Confusion",
  "total": 12,
  "first": {
    "type": "AnnotationPage",
    "items": [
      { ... }
    ]
  }
}
```

## Insights Export

Export insights with evidence links:

```http
GET /api/insights/:id/export
Accept: application/ld+json; profile="http://www.w3.org/ns/anno.jsonld"
```

**Response:**

```json
{
  "@context": [
    "http://www.w3.org/ns/anno.jsonld",
    "https://cluster.research/ns/research.jsonld"
  ],
  "id": "urn:uuid:insight-id",
  "type": ["Annotation", "research:Insight"],
  "motivation": "describing",
  "body": {
    "type": "TextualBody",
    "value": "Users experience critical confusion immediately after account creation, with 4 of 6 participants unable to identify their next action.",
    "format": "text/markdown",
    "purpose": "describing"
  },
  "target": [
    "urn:uuid:annotation-1",
    "urn:uuid:annotation-2",
    "urn:uuid:annotation-3",
    "urn:uuid:annotation-4"
  ],
  "research:confidence": "high",
  "research:impact": "critical",
  "research:recommendation": "Add onboarding checklist to post-signup dashboard"
}
```

## Bulk Export

Export all annotations for a study:

```http
GET /api/studies/:id/export/bulk
Accept: application/ld+json
```

Returns a JSON array of all annotations (no pagination):

```json
[
  { "@context": [...], "type": "Annotation", ... },
  { "@context": [...], "type": "Annotation", ... }
]
```

:::caution Large Exports
For studies with >1000 annotations, use paginated export instead.
:::

## Export Options

### Include/Exclude Fields

```http
GET /api/studies/:id/export?include=body,target&exclude=creator
```

| Parameter | Description |
|-----------|-------------|
| `include` | Only include these fields |
| `exclude` | Exclude these fields |

### Filter by Date

```http
GET /api/studies/:id/export?from=2025-01-01&to=2025-01-31
```

### Filter by Motivation

```http
GET /api/studies/:id/export?motivation=highlighting,tagging
```

### Exclude Research Extensions

For pure W3C compliance (without Cluster extensions):

```http
GET /api/studies/:id/export?pure=true
```

This removes `research:*` properties and uses only the W3C context.

## Download as File

### JSON-LD File

```http
GET /api/studies/:id/export/download
Accept: application/ld+json
```

**Response Headers:**

```http
Content-Type: application/ld+json
Content-Disposition: attachment; filename="study-name-annotations.jsonld"
```

### ZIP Archive

Export with separate files per annotation:

```http
GET /api/studies/:id/export/download?format=zip
```

**ZIP Structure:**

```
study-name-annotations/
├── collection.jsonld
├── annotations/
│   ├── a1b2c3d4.jsonld
│   ├── b2c3d4e5.jsonld
│   └── ...
├── clusters/
│   ├── cluster-1.jsonld
│   └── ...
└── insights/
    ├── insight-1.jsonld
    └── ...
```

## Validation

Validate export against W3C schemas:

```http
POST /api/validate
Content-Type: application/ld+json
```

**Request Body:**

```json
{
  "@context": "http://www.w3.org/ns/anno.jsonld",
  "type": "Annotation",
  "target": "https://example.com/page"
}
```

**Response:**

```json
{
  "valid": true,
  "warnings": [],
  "errors": []
}
```

### Validation Errors

```json
{
  "valid": false,
  "errors": [
    {
      "path": "target",
      "message": "Target must have a source or be a string URI",
      "spec": "https://www.w3.org/TR/annotation-model/#targets"
    }
  ]
}
```

## JSON-LD Context

### W3C Context

```
http://www.w3.org/ns/anno.jsonld
```

### Cluster Research Context

```
https://cluster.research/ns/research.jsonld
```

**Research Context Definition:**

```json
{
  "@context": {
    "research": "https://cluster.research/ns/research#",

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

## Import

Import W3C annotations from other tools:

```http
POST /api/annotations/import
Content-Type: application/ld+json
```

**Request Body:**

```json
{
  "annotations": [
    {
      "@context": "http://www.w3.org/ns/anno.jsonld",
      "type": "Annotation",
      "target": "https://example.com/document",
      "body": {
        "type": "TextualBody",
        "value": "Imported annotation"
      }
    }
  ],
  "options": {
    "studyId": "uuid",
    "mapSources": {
      "https://old-system.com/files/": "https://company.sharepoint.com/sites/research/"
    }
  }
}
```

**Response:**

```json
{
  "imported": 15,
  "skipped": 2,
  "errors": [
    {
      "index": 7,
      "error": "Invalid selector type"
    }
  ]
}
```

## Interoperability

Cluster exports are compatible with:

| Tool | Format | Notes |
|------|--------|-------|
| **Hypothesis** | W3C JSON-LD | Direct import |
| **Recogito** | W3C JSON-LD | Direct import |
| **CATMA** | W3C JSON-LD | May need source mapping |
| **Dovetail** | Custom | Requires transformation |

## Next Steps

- [Files API](/api/files) — Access source files
- [Studies API](/api/studies) — Manage research studies
