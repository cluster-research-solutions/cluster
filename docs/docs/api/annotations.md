---
sidebar_position: 3
title: Annotations
---

# Annotations API

The Annotations API implements the [W3C Web Annotation Protocol](https://www.w3.org/TR/annotation-protocol/) for creating, reading, updating, and deleting annotations.

## W3C Compliance

All annotation responses conform to:

- [W3C Web Annotation Data Model](https://www.w3.org/TR/annotation-model/)
- [W3C Web Annotation Vocabulary](https://www.w3.org/TR/annotation-vocab/)
- [W3C Web Annotation Protocol](https://www.w3.org/TR/annotation-protocol/)

Responses include the W3C JSON-LD context and Cluster's research extensions.

## Content Negotiation

Request W3C JSON-LD format:

```http
Accept: application/ld+json; profile="http://www.w3.org/ns/anno.jsonld"
```

Or standard JSON (internally converted):

```http
Accept: application/json
```

## Endpoints

### List Annotations

```http
GET /api/annotations
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `studyId` | uuid | Filter by study |
| `fileId` | uuid | Filter by file reference |
| `motivation` | string | Filter by motivation (highlighting, tagging, etc.) |
| `tagId` | uuid | Filter by tag |
| `creatorId` | uuid | Filter by creator |
| `participantId` | string | Filter by participant ID |
| `offset` | integer | Pagination offset |
| `limit` | integer | Results per page (max 100) |

**Response:**

```json
{
  "@context": [
    "http://www.w3.org/ns/anno.jsonld",
    "https://cluster.research/ns/research.jsonld"
  ],
  "type": "AnnotationCollection",
  "total": 42,
  "first": "/api/annotations?offset=0&limit=20",
  "items": [
    {
      "id": "urn:uuid:a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "type": "Annotation",
      "motivation": "highlighting",
      "created": "2025-01-03T14:30:00Z",
      "creator": {
        "id": "urn:uuid:user-id",
        "type": "Person",
        "name": "Jane Smith"
      },
      "target": {
        "source": "https://company.sharepoint.com/sites/research/interviews/p05.mp4",
        "selector": {
          "type": "FragmentSelector",
          "conformsTo": "http://www.w3.org/TR/media-frags/",
          "value": "t=324.5,358.2"
        }
      }
    }
  ]
}
```

### Get Annotation

```http
GET /api/annotations/:id
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
    "id": "urn:uuid:550e8400-e29b-41d4-a716-446655440000",
    "type": "Person",
    "name": "Jane Smith"
  },
  "body": [
    {
      "type": "SpecificResource",
      "source": "urn:uuid:tag-pain-point",
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

### Create Annotation

```http
POST /api/annotations
Content-Type: application/ld+json; profile="http://www.w3.org/ns/anno.jsonld"
```

**Request Body:**

```json
{
  "@context": [
    "http://www.w3.org/ns/anno.jsonld",
    "https://cluster.research/ns/research.jsonld"
  ],
  "type": "Annotation",
  "motivation": "highlighting",
  "target": {
    "source": "https://company.sharepoint.com/sites/research/interviews/p05.mp4",
    "selector": {
      "type": "FragmentSelector",
      "conformsTo": "http://www.w3.org/TR/media-frags/",
      "value": "t=120,145"
    }
  },
  "research:study": "urn:uuid:study-id",
  "research:participant": "P05"
}
```

**Response:**

```http
HTTP/1.1 201 Created
Location: /api/annotations/a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

```json
{
  "@context": [
    "http://www.w3.org/ns/anno.jsonld",
    "https://cluster.research/ns/research.jsonld"
  ],
  "id": "urn:uuid:a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "type": "Annotation",
  "motivation": "highlighting",
  "created": "2025-01-03T14:30:00Z",
  "creator": {
    "id": "urn:uuid:user-id",
    "type": "Person",
    "name": "Jane Smith"
  },
  "target": {
    "source": "https://company.sharepoint.com/sites/research/interviews/p05.mp4",
    "selector": {
      "type": "FragmentSelector",
      "conformsTo": "http://www.w3.org/TR/media-frags/",
      "value": "t=120,145"
    }
  },
  "research:study": "urn:uuid:study-id",
  "research:participant": "P05"
}
```

### Update Annotation

```http
PUT /api/annotations/:id
Content-Type: application/ld+json; profile="http://www.w3.org/ns/anno.jsonld"
```

**Request Body:**

Full annotation object (replaces existing):

```json
{
  "@context": [
    "http://www.w3.org/ns/anno.jsonld",
    "https://cluster.research/ns/research.jsonld"
  ],
  "type": "Annotation",
  "motivation": ["highlighting", "tagging"],
  "body": [
    {
      "type": "SpecificResource",
      "source": "urn:uuid:tag-id",
      "purpose": "tagging"
    }
  ],
  "target": {
    "source": "https://company.sharepoint.com/sites/research/interviews/p05.mp4",
    "selector": {
      "type": "FragmentSelector",
      "conformsTo": "http://www.w3.org/TR/media-frags/",
      "value": "t=120,145"
    }
  }
}
```

**Response:**

```http
HTTP/1.1 200 OK
```

Returns updated annotation.

### Delete Annotation

```http
DELETE /api/annotations/:id
```

**Response:**

```http
HTTP/1.1 204 No Content
```

## Selector Types

### TextQuoteSelector

For selecting text in documents/transcripts:

```json
{
  "type": "TextQuoteSelector",
  "exact": "the exact selected text",
  "prefix": "50 chars before ",
  "suffix": " 50 chars after"
}
```

### TextPositionSelector

Fallback for text selection:

```json
{
  "type": "TextPositionSelector",
  "start": 100,
  "end": 150
}
```

### FragmentSelector

For video/audio time ranges:

```json
{
  "type": "FragmentSelector",
  "conformsTo": "http://www.w3.org/TR/media-frags/",
  "value": "t=30.5,45.2"
}
```

Time format: `t=start,end` (seconds with decimals)

## Motivations

Supported [W3C motivations](https://www.w3.org/TR/annotation-vocab/#named-individuals):

| Motivation | Description |
|------------|-------------|
| `highlighting` | Mark text/video segment |
| `tagging` | Apply tag to target |
| `commenting` | Add text comment |
| `describing` | Describe the target |
| `linking` | Link multiple targets |
| `classifying` | Classify into category |
| `questioning` | Pose a question |
| `bookmarking` | Bookmark for later |

## Research Extensions

Cluster extends W3C annotations with research metadata:

```json
{
  "research:study": "urn:uuid:study-id",
  "research:participant": "P05",
  "research:session": "2025-01-03-morning"
}
```

## Tagging

To add tags to an annotation, include them in the body:

```json
{
  "type": "Annotation",
  "motivation": ["highlighting", "tagging"],
  "body": [
    {
      "type": "SpecificResource",
      "source": "urn:uuid:tag-id-1",
      "purpose": "tagging"
    },
    {
      "type": "SpecificResource",
      "source": "urn:uuid:tag-id-2",
      "purpose": "tagging"
    }
  ],
  "target": { ... }
}
```

## Comments

To add a comment:

```json
{
  "type": "Annotation",
  "motivation": ["highlighting", "commenting"],
  "body": {
    "type": "TextualBody",
    "value": "This is a key moment in the interview",
    "format": "text/plain",
    "purpose": "commenting"
  },
  "target": { ... }
}
```

## Cross-Document Links

To link annotations across files:

```json
{
  "type": "Annotation",
  "motivation": "linking",
  "body": {
    "type": "TextualBody",
    "value": "Same pattern observed in both interviews",
    "purpose": "describing"
  },
  "target": [
    {
      "source": "https://company.sharepoint.com/sites/research/interviews/p05.txt",
      "selector": {
        "type": "TextQuoteSelector",
        "exact": "I didn't know what to do"
      }
    },
    {
      "source": "https://company.sharepoint.com/sites/research/interviews/p03.txt",
      "selector": {
        "type": "TextQuoteSelector",
        "exact": "the next step wasn't clear"
      }
    }
  ]
}
```

## Batch Operations

### Create Multiple Annotations

```http
POST /api/annotations/batch
Content-Type: application/json
```

```json
{
  "annotations": [
    { ... },
    { ... }
  ]
}
```

**Response:**

```json
{
  "created": 2,
  "annotations": [
    { "id": "urn:uuid:...", ... },
    { "id": "urn:uuid:...", ... }
  ]
}
```

### Delete Multiple Annotations

```http
DELETE /api/annotations/batch
Content-Type: application/json
```

```json
{
  "ids": [
    "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "b2c3d4e5-f6a7-8901-bcde-f23456789012"
  ]
}
```

## Search

### Full-Text Search

```http
GET /api/annotations/search?q=confusion+onboarding
```

**Response:**

```json
{
  "total": 5,
  "items": [
    {
      "id": "urn:uuid:...",
      "score": 0.95,
      "highlight": "...I was <mark>confused</mark> during <mark>onboarding</mark>..."
    }
  ]
}
```

### Advanced Search

```http
POST /api/annotations/search
Content-Type: application/json
```

```json
{
  "query": "confusion",
  "filters": {
    "studyId": "uuid",
    "motivation": ["highlighting", "commenting"],
    "tags": ["pain-point"],
    "dateRange": {
      "from": "2025-01-01",
      "to": "2025-01-31"
    }
  },
  "sort": {
    "field": "created",
    "order": "desc"
  }
}
```

## Next Steps

- [W3C Export](/api/w3c-export) — Export annotations as W3C JSON-LD
- [Clusters API](/api/clusters) — Group annotations into collections
