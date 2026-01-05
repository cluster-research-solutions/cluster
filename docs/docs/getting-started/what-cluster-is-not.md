---
sidebar_position: 3
title: What Cluster is Not
---

# What Cluster is Not

Understanding Cluster's boundaries helps you decide if it's right for your needs.

## Not a Transcription Service

Cluster does **not** transcribe audio or video files. It works with transcripts you already have:

- **Microsoft Teams** meeting transcripts (.vtt files in SharePoint)
- **Zoom** cloud recording transcripts
- **Otter.ai**, **Rev**, or other transcription service exports
- Manual transcripts you've created

:::tip Future Roadmap
AI transcription (via Whisper or similar) is on the roadmap but not in the current version.
:::

## Not a Recording Tool

Cluster does **not** record meetings or research sessions. Use dedicated tools for recording:

- **Zoom**, **Microsoft Teams**, **Google Meet** for remote sessions
- **Lookback**, **UserTesting** for moderated research
- **Loom**, **Grain** for async video capture

Cluster integrates with your recordings stored in SharePoint or Google Drive.

## Not a Participant Recruitment Platform

Cluster does **not** help you find research participants. For recruitment, consider:

- **User Interviews** — General participant recruitment
- **Respondent** — B2B and professional panels
- **Prolific** — Academic and research panels
- **UserTesting** — Integrated panel + testing

## Not a Usability Testing Platform

Cluster does **not** run unmoderated usability tests. For that, use:

- **Maze** — Prototype testing and surveys
- **UserTesting** — Moderated and unmoderated testing
- **Lookback** — Live session recording
- **Optimal Workshop** — Card sorting, tree testing

Cluster helps you **synthesize** the results from these tools.

## Not a Survey Tool

Cluster does **not** create or distribute surveys. For quantitative research:

- **Qualtrics** — Enterprise surveys
- **Typeform** — Conversational surveys
- **SurveyMonkey** — General-purpose surveys
- **Sprig** — In-product surveys

## Not a Full Repository (Yet)

Cluster currently focuses on **synthesis workflows**:

✅ Annotating transcripts and videos
✅ Clustering and affinity mapping
✅ Creating insights
✅ Exporting in W3C format

The following repository features are on the roadmap:

⏳ Full-text search across all research
⏳ Research project management
⏳ Participant database
⏳ Research calendar and scheduling

## When to Choose Cluster

**Choose Cluster if:**
- Data ownership is a priority
- You're in a regulated industry (healthcare, finance, government)
- You want to avoid vendor lock-in
- You need W3C-compliant annotation export
- You prefer self-hosted solutions
- You're building a custom research stack

**Consider alternatives if:**
- You need an all-in-one solution today
- You want built-in transcription
- You prefer managed SaaS with no infrastructure
- You need extensive integrations out of the box

## Complementary Tools

Cluster works well alongside:

| Category | Tools | Integration |
|----------|-------|-------------|
| **Recording** | Zoom, Teams, Meet | Import recordings from SharePoint |
| **Transcription** | Otter, Rev, Temi | Import .vtt/.srt files |
| **Recruitment** | User Interviews | Manual participant metadata |
| **Testing** | Maze, UserTesting | Import session recordings |
| **Knowledge Base** | Notion, Confluence | Export insights for sharing |

## Next Steps

- [Hosting Options](/getting-started/hosting-options) — Deployment models
- [Architecture Overview](/architecture/overview) — How Cluster works
