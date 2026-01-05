---
sidebar_position: 5
title: Files
---

# Files API

The Files API provides access to SharePoint/OneDrive files through Microsoft Graph. Files remain in your organization's cloud storage—Cluster only stores references and metadata.

## Overview

```
User Request → Cluster API → Microsoft Graph → SharePoint
                   ↓
           (cache metadata)
                   ↓
            Return to User
```

Cluster proxies file requests to SharePoint using the On-Behalf-Of OAuth flow. This allows:

- Seamless access to SharePoint files
- Proper permission enforcement (user sees only their files)
- Metadata caching for faster browsing
- Video/audio streaming support

## Authentication

All file endpoints require a valid Azure AD token with SharePoint scopes:

- `Files.Read.All` — Read files user can access
- `Sites.Read.All` — List SharePoint sites

## Endpoints

### List Sites

Get SharePoint sites the user can access:

```http
GET /api/files/sites
```

**Response:**

```json
{
  "data": [
    {
      "id": "site-id",
      "name": "Research Team",
      "webUrl": "https://company.sharepoint.com/sites/research",
      "description": "UX Research files and recordings"
    }
  ]
}
```

### List Drives

Get drives (document libraries) in a site:

```http
GET /api/files/sites/:siteId/drives
```

**Response:**

```json
{
  "data": [
    {
      "id": "drive-id",
      "name": "Documents",
      "driveType": "documentLibrary",
      "webUrl": "https://company.sharepoint.com/sites/research/Documents"
    },
    {
      "id": "drive-id-2",
      "name": "Interview Recordings",
      "driveType": "documentLibrary"
    }
  ]
}
```

### List Files/Folders

Browse files in a drive:

```http
GET /api/files/drives/:driveId/items
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `path` | string | Folder path (e.g., `/Interviews/2025`) |
| `folderId` | string | Specific folder ID |

**Response:**

```json
{
  "data": [
    {
      "id": "item-id-1",
      "name": "P05-Interview.mp4",
      "type": "file",
      "mimeType": "video/mp4",
      "size": 524288000,
      "webUrl": "https://company.sharepoint.com/...",
      "createdDateTime": "2025-01-02T10:00:00Z",
      "lastModifiedDateTime": "2025-01-02T10:30:00Z",
      "createdBy": {
        "user": {
          "displayName": "Jane Smith"
        }
      }
    },
    {
      "id": "item-id-2",
      "name": "P05-Transcript.vtt",
      "type": "file",
      "mimeType": "text/vtt",
      "size": 15360
    },
    {
      "id": "folder-id",
      "name": "Session Notes",
      "type": "folder",
      "childCount": 5
    }
  ],
  "meta": {
    "path": "/Interviews/2025",
    "parentId": "parent-folder-id"
  }
}
```

### Get File Metadata

```http
GET /api/files/drives/:driveId/items/:itemId
```

**Response:**

```json
{
  "data": {
    "id": "item-id",
    "name": "P05-Interview.mp4",
    "type": "file",
    "mimeType": "video/mp4",
    "size": 524288000,
    "webUrl": "https://company.sharepoint.com/...",
    "downloadUrl": "https://...",
    "thumbnails": [
      {
        "large": {
          "url": "https://..."
        }
      }
    ],
    "video": {
      "duration": 3600000,
      "width": 1920,
      "height": 1080
    }
  }
}
```

### Get File Content

Stream file content (for viewing/playing):

```http
GET /api/files/drives/:driveId/items/:itemId/content
```

**Response:**

Proxied file content with appropriate headers:

```http
Content-Type: video/mp4
Content-Length: 524288000
Accept-Ranges: bytes
```

### Range Requests

Video/audio players use range requests for seeking:

```http
GET /api/files/drives/:driveId/items/:itemId/content
Range: bytes=1000000-2000000
```

**Response:**

```http
HTTP/1.1 206 Partial Content
Content-Range: bytes 1000000-2000000/524288000
Content-Length: 1000001
```

### Get Transcript

Get parsed transcript for a video/audio file:

```http
GET /api/files/drives/:driveId/items/:itemId/transcript
```

**Response:**

```json
{
  "data": {
    "format": "vtt",
    "duration": 3600.5,
    "cues": [
      {
        "id": "1",
        "startTime": 0.0,
        "endTime": 5.2,
        "text": "Welcome to the interview.",
        "speaker": "Interviewer"
      },
      {
        "id": "2",
        "startTime": 5.5,
        "endTime": 12.3,
        "text": "Thanks for having me. I'm excited to share my experience.",
        "speaker": "Participant"
      }
    ]
  }
}
```

Cluster automatically:
1. Detects associated transcript files (`.vtt`, `.srt`)
2. Parses cues and extracts speakers
3. Syncs with media timestamps

### Search Files

Search across SharePoint:

```http
GET /api/files/search?q=interview+onboarding
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `q` | string | Search query |
| `siteId` | string | Limit to specific site |
| `type` | string | Filter by type (`file`, `folder`) |
| `mimeType` | string | Filter by MIME type |

**Response:**

```json
{
  "data": [
    {
      "id": "item-id",
      "name": "Onboarding-Research-P05.mp4",
      "path": "/Research/Interviews",
      "webUrl": "...",
      "highlights": [
        "...<strong>onboarding</strong> research..."
      ]
    }
  ]
}
```

## File References

Cluster caches file metadata for faster access and annotation linking.

### Create File Reference

Link a SharePoint file to a study:

```http
POST /api/files/refs
```

**Request:**

```json
{
  "driveId": "drive-id",
  "itemId": "item-id",
  "studyId": "study-uuid"
}
```

**Response:**

```json
{
  "data": {
    "id": "file-ref-uuid",
    "name": "P05-Interview.mp4",
    "mimeType": "video/mp4",
    "webUrl": "...",
    "studyId": "study-uuid",
    "transcriptFileId": "transcript-ref-uuid"
  }
}
```

### List File References

Get files linked to a study:

```http
GET /api/studies/:studyId/files
```

**Response:**

```json
{
  "data": [
    {
      "id": "file-ref-uuid",
      "name": "P05-Interview.mp4",
      "mimeType": "video/mp4",
      "annotationCount": 24,
      "lastAnnotatedAt": "2025-01-03T14:30:00Z"
    }
  ]
}
```

### Sync File Metadata

Refresh cached metadata from SharePoint:

```http
POST /api/files/refs/:id/sync
```

**Response:**

```json
{
  "data": {
    "id": "file-ref-uuid",
    "synced": true,
    "changes": {
      "name": {
        "old": "Interview.mp4",
        "new": "P05-Interview.mp4"
      }
    }
  }
}
```

## Supported File Types

### Video

| Extension | MIME Type | Features |
|-----------|-----------|----------|
| `.mp4` | video/mp4 | Streaming, thumbnails |
| `.webm` | video/webm | Streaming |
| `.mov` | video/quicktime | Streaming |

### Audio

| Extension | MIME Type | Features |
|-----------|-----------|----------|
| `.mp3` | audio/mpeg | Streaming |
| `.wav` | audio/wav | Streaming |
| `.m4a` | audio/mp4 | Streaming |

### Transcripts

| Extension | MIME Type | Features |
|-----------|-----------|----------|
| `.vtt` | text/vtt | WebVTT (Teams transcripts) |
| `.srt` | application/x-subrip | SubRip format |
| `.txt` | text/plain | Plain text |

### Documents

| Extension | MIME Type | Features |
|-----------|-----------|----------|
| `.docx` | application/vnd.openxmlformats... | Text extraction |
| `.pdf` | application/pdf | Text extraction |
| `.txt` | text/plain | Direct viewing |
| `.md` | text/markdown | Rendered viewing |

## Error Handling

### 404 File Not Found

```json
{
  "error": {
    "code": "FILE_NOT_FOUND",
    "message": "File not found or access denied",
    "driveId": "...",
    "itemId": "..."
  }
}
```

### 403 Access Denied

```json
{
  "error": {
    "code": "ACCESS_DENIED",
    "message": "You do not have permission to access this file"
  }
}
```

### 502 SharePoint Error

```json
{
  "error": {
    "code": "UPSTREAM_ERROR",
    "message": "SharePoint returned an error",
    "upstream": {
      "code": "itemNotFound",
      "message": "The resource could not be found"
    }
  }
}
```

## Caching

Cluster caches:

| Data | Cache Duration | Invalidation |
|------|----------------|--------------|
| Site/drive list | 1 hour | Manual refresh |
| Folder contents | 5 minutes | On browse |
| File metadata | 1 hour | On sync |
| Transcripts | Until file changes | Content hash check |

## Next Steps

- [Studies API](/api/studies) — Manage research studies
- [Annotations API](/api/annotations) — Create annotations on files
