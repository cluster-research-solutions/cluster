---
sidebar_position: 7
title: Clusters
---

# Clusters API

Clusters (affinity groups) are collections of annotations organized thematically. They support the synthesis process by allowing researchers to group related findings.

## W3C Compliance

Clusters are implemented as W3C Annotation Collections, making them fully portable:

```json
{
  "@context": [
    "http://www.w3.org/ns/anno.jsonld",
    "https://cluster.research/ns/research.jsonld"
  ],
  "type": ["AnnotationCollection", "research:AffinityGroup"],
  "label": "Onboarding Confusion"
}
```

## Endpoints

### List Clusters

```http
GET /api/clusters
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `studyId` | uuid | Filter by study |
| `boardId` | uuid | Filter by synthesis board |

**Response:**

```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Onboarding Confusion",
      "color": "#e74c3c",
      "studyId": "study-uuid",
      "boardId": "board-uuid",
      "position": {
        "x": 100,
        "y": 200
      },
      "size": {
        "width": 300,
        "height": 400
      },
      "annotationCount": 8,
      "createdBy": {
        "id": "user-uuid",
        "name": "Jane Smith"
      },
      "createdAt": "2025-01-03T14:00:00Z",
      "updatedAt": "2025-01-03T15:30:00Z"
    }
  ]
}
```

### Get Cluster

```http
GET /api/clusters/:id
```

**Response:**

```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Onboarding Confusion",
    "color": "#e74c3c",
    "studyId": "study-uuid",
    "position": {
      "x": 100,
      "y": 200
    },
    "annotations": [
      {
        "id": "annotation-uuid-1",
        "position": { "x": 10, "y": 20 },
        "preview": "I had no idea what to do...",
        "participant": "P01"
      },
      {
        "id": "annotation-uuid-2",
        "position": { "x": 10, "y": 80 },
        "preview": "The next step wasn't clear...",
        "participant": "P03"
      }
    ]
  }
}
```

### Create Cluster

```http
POST /api/clusters
Content-Type: application/json
```

**Request:**

```json
{
  "name": "Navigation Issues",
  "color": "#3498db",
  "studyId": "study-uuid",
  "boardId": "board-uuid",
  "position": {
    "x": 400,
    "y": 100
  }
}
```

**Response:**

```http
HTTP/1.1 201 Created
Location: /api/clusters/660e8400-e29b-41d4-a716-446655440000
```

```json
{
  "data": {
    "id": "660e8400-e29b-41d4-a716-446655440000",
    "name": "Navigation Issues",
    "color": "#3498db",
    "annotationCount": 0
  }
}
```

### Update Cluster

```http
PATCH /api/clusters/:id
Content-Type: application/json
```

**Request:**

```json
{
  "name": "Navigation & Wayfinding Issues",
  "color": "#2980b9",
  "position": {
    "x": 450,
    "y": 150
  },
  "size": {
    "width": 350,
    "height": 500
  }
}
```

### Delete Cluster

```http
DELETE /api/clusters/:id
```

Annotations in the cluster are removed from the cluster but not deleted.

**Response:**

```http
HTTP/1.1 204 No Content
```

## Cluster Annotations

### Add Annotation to Cluster

```http
POST /api/clusters/:id/annotations
Content-Type: application/json
```

**Request:**

```json
{
  "annotationId": "annotation-uuid",
  "position": {
    "x": 20,
    "y": 100
  }
}
```

**Response:**

```json
{
  "data": {
    "clusterId": "cluster-uuid",
    "annotationId": "annotation-uuid",
    "position": { "x": 20, "y": 100 },
    "sortOrder": 3
  }
}
```

### Remove Annotation from Cluster

```http
DELETE /api/clusters/:id/annotations/:annotationId
```

**Response:**

```http
HTTP/1.1 204 No Content
```

### Reorder Annotations

```http
PUT /api/clusters/:id/annotations/order
Content-Type: application/json
```

**Request:**

```json
{
  "order": [
    { "annotationId": "uuid-1", "sortOrder": 0 },
    { "annotationId": "uuid-2", "sortOrder": 1 },
    { "annotationId": "uuid-3", "sortOrder": 2 }
  ]
}
```

### Move Annotation Position

```http
PATCH /api/clusters/:id/annotations/:annotationId
Content-Type: application/json
```

**Request:**

```json
{
  "position": {
    "x": 50,
    "y": 120
  }
}
```

## Synthesis Boards

Boards are canvases that contain clusters for visual organization.

### List Boards

```http
GET /api/studies/:studyId/boards
```

**Response:**

```json
{
  "data": [
    {
      "id": "board-uuid",
      "name": "Main Synthesis",
      "studyId": "study-uuid",
      "clusterCount": 5,
      "createdAt": "2025-01-03T10:00:00Z"
    }
  ]
}
```

### Create Board

```http
POST /api/studies/:studyId/boards
Content-Type: application/json
```

**Request:**

```json
{
  "name": "Thematic Analysis"
}
```

### Get Board with Clusters

```http
GET /api/boards/:id
```

**Response:**

```json
{
  "data": {
    "id": "board-uuid",
    "name": "Main Synthesis",
    "clusters": [
      {
        "id": "cluster-1",
        "name": "Onboarding Confusion",
        "color": "#e74c3c",
        "position": { "x": 100, "y": 200 },
        "size": { "width": 300, "height": 400 },
        "annotationCount": 8
      },
      {
        "id": "cluster-2",
        "name": "Navigation Issues",
        "color": "#3498db",
        "position": { "x": 450, "y": 150 },
        "size": { "width": 280, "height": 350 },
        "annotationCount": 5
      }
    ]
  }
}
```

## Batch Operations

### Move Multiple Annotations

Move annotations between clusters:

```http
POST /api/clusters/batch/move
Content-Type: application/json
```

**Request:**

```json
{
  "annotationIds": ["uuid-1", "uuid-2", "uuid-3"],
  "fromClusterId": "cluster-a",
  "toClusterId": "cluster-b"
}
```

### Merge Clusters

Combine two clusters into one:

```http
POST /api/clusters/:id/merge
Content-Type: application/json
```

**Request:**

```json
{
  "sourceClusterId": "cluster-to-merge",
  "keepPositions": false
}
```

The source cluster is deleted after merge.

### Split Cluster

Create a new cluster with selected annotations:

```http
POST /api/clusters/:id/split
Content-Type: application/json
```

**Request:**

```json
{
  "name": "New Cluster",
  "color": "#9b59b6",
  "annotationIds": ["uuid-1", "uuid-2"]
}
```

**Response:**

```json
{
  "data": {
    "newCluster": {
      "id": "new-cluster-uuid",
      "name": "New Cluster",
      "annotationCount": 2
    },
    "originalCluster": {
      "id": "original-uuid",
      "annotationCount": 6
    }
  }
}
```

## W3C Export

### Export Cluster as Collection

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
  "total": 8,
  "first": {
    "type": "AnnotationPage",
    "items": [
      {
        "id": "urn:uuid:annotation-1",
        "type": "Annotation",
        "motivation": "highlighting",
        "target": {
          "source": "https://company.sharepoint.com/...",
          "selector": {
            "type": "TextQuoteSelector",
            "exact": "I had no idea what to do..."
          }
        }
      }
    ]
  }
}
```

## Real-time Updates

Cluster changes can be synced in real-time for collaborative synthesis.

### WebSocket Connection

```javascript
const ws = new WebSocket('wss://cluster.yourcompany.com/api/boards/:id/ws');

ws.onmessage = (event) => {
  const update = JSON.parse(event.data);
  // { type: 'cluster.moved', clusterId: '...', position: {...} }
  // { type: 'annotation.added', clusterId: '...', annotationId: '...' }
};
```

### Event Types

| Event | Description |
|-------|-------------|
| `cluster.created` | New cluster added |
| `cluster.updated` | Cluster properties changed |
| `cluster.deleted` | Cluster removed |
| `cluster.moved` | Cluster position changed |
| `annotation.added` | Annotation added to cluster |
| `annotation.removed` | Annotation removed from cluster |
| `annotation.moved` | Annotation position changed |

## Auto-Clustering (Future)

AI-assisted clustering (planned feature):

```http
POST /api/studies/:id/auto-cluster
Content-Type: application/json
```

**Request:**

```json
{
  "method": "semantic",
  "minClusterSize": 3,
  "maxClusters": 10
}
```

**Response:**

```json
{
  "data": {
    "suggestedClusters": [
      {
        "name": "Suggested: Onboarding Issues",
        "annotations": ["uuid-1", "uuid-2", "uuid-3"],
        "confidence": 0.85
      }
    ]
  }
}
```

## Next Steps

- [Annotations API](/api/annotations) — Create annotations to cluster
- [W3C Export](/api/w3c-export) — Export clusters as W3C collections
- [Studies API](/api/studies) — Manage research studies
