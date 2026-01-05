---
sidebar_position: 3
title: Google Setup
---

# Google Workspace Setup

:::caution Coming Soon
Google Workspace authentication and Google Drive integration are planned for a future release. This page documents the intended configuration.
:::

## Overview

Google authentication will enable:
- Sign in with Google Workspace accounts
- Access to Google Drive files
- Google Meet transcript import

## Planned Configuration

### Google Cloud Console

1. Create a project in [Google Cloud Console](https://console.cloud.google.com)
2. Enable the following APIs:
   - Google Drive API
   - Google OAuth2 API

3. Configure OAuth consent screen:
   - App name: `Cluster`
   - User type: Internal (for Workspace) or External
   - Scopes: `drive.readonly`, `userinfo.profile`, `userinfo.email`

4. Create OAuth 2.0 credentials:
   - Application type: Web application
   - Authorized redirect URIs: `http://localhost:3000/auth/google/callback`

### Environment Variables

```bash
# Google OAuth
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret

# Frontend
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

### Required Scopes

| Scope | Purpose |
|-------|---------|
| `https://www.googleapis.com/auth/userinfo.profile` | User profile |
| `https://www.googleapis.com/auth/userinfo.email` | User email |
| `https://www.googleapis.com/auth/drive.readonly` | Read Drive files |

## Feature Roadmap

### Phase 1: Authentication
- Google OAuth login
- User provisioning
- Organization creation for Workspace domains

### Phase 2: Drive Integration
- Browse Google Drive folders
- Access shared drives
- Stream video/audio files

### Phase 3: Google Meet
- Import Meet recordings from Drive
- Parse Meet transcript format
- Speaker attribution

## Workarounds

Until Google support is available:

1. **Use Azure AD** for authentication
2. **Export from Drive** manually and upload to SharePoint
3. **Use third-party tools** like Zapier to sync Drive → SharePoint

## Stay Updated

Watch the [GitHub repository](https://github.com/cluster-research-solutions/cluster) for updates on Google Workspace support.
