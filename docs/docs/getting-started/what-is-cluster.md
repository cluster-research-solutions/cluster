---
sidebar_position: 2
title: What is Cluster?
---

# What is Cluster?

Cluster is a **research synthesis platform** designed for UX researchers, product teams, and anyone who conducts qualitative research. It helps you:

1. **Annotate** research recordings, transcripts, and documents
2. **Organize** findings into thematic clusters
3. **Synthesize** insights backed by evidence
4. **Export** everything in open, portable formats

## Core Concepts

### Annotations

An annotation is a connection between your commentary and a specific piece of source material. In Cluster, annotations follow the [W3C Web Annotation Data Model](https://www.w3.org/TR/annotation-model/), which means:

- **Highlights** — Select text in a transcript or a time range in a video
- **Tags** — Apply taxonomy tags to categorize findings
- **Comments** — Add notes and observations
- **Links** — Connect related moments across documents

```json
{
  "@context": "http://www.w3.org/ns/anno.jsonld",
  "type": "Annotation",
  "motivation": "highlighting",
  "target": {
    "source": "https://your-sharepoint.com/interview-p05.vtt",
    "selector": {
      "type": "TextQuoteSelector",
      "exact": "I had no idea what to do after I created my account"
    }
  }
}
```

### Clusters

A cluster is a group of related annotations. Use clusters to:

- Group pain points by theme
- Organize feature requests
- Build affinity maps
- Prepare for synthesis sessions

Clusters appear on a visual canvas where you can drag, arrange, and connect annotations.

### Insights

An insight is an evidence-backed claim. Unlike annotations (which are observations), insights are conclusions:

- "Users experience confusion immediately after signup"
- "The onboarding flow lacks clear next steps"
- "Power users want keyboard shortcuts"

Each insight links to the annotations that support it, creating a traceable chain from raw data to recommendations.

## How Data Flows

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Source Files  │────▶│   Annotations   │────▶│    Insights     │
│   (SharePoint)  │     │   (PostgreSQL)  │     │   (PostgreSQL)  │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │                      │                        │
         │                      │                        │
         ▼                      ▼                        ▼
   Files stay in         Annotations stored        Insights link to
   your cloud            as W3C JSON-LD           supporting evidence
```

**Key insight**: Your source files (videos, transcripts, documents) never leave your cloud storage. Cluster only stores references and annotations.

## Supported File Types

| Type | Extensions | Features |
|------|------------|----------|
| **Video** | .mp4, .webm, .mov | Time-based annotations, clip creation |
| **Audio** | .mp3, .wav, .m4a | Time-based annotations |
| **Transcripts** | .vtt, .srt, .txt | Text highlighting, speaker labels |
| **Documents** | .docx, .pdf | Text highlighting |

## Who Uses Cluster?

### UX Researchers
Primary users who conduct interviews, usability tests, and synthesis sessions. Cluster replaces or augments tools like Dovetail, Marvin, or Condens.

### Product Managers
Secondary researchers who review research findings, create insights, and connect research to product decisions.

### Research Operations
Teams responsible for research infrastructure, data governance, and tool administration. Cluster's self-hosting model gives ResearchOps full control.

### Agencies & Consultants
Research practitioners who need to hand off data to clients. W3C-standard export means clients aren't locked into Cluster.

## Next Steps

- [What Cluster is Not](/getting-started/what-cluster-is-not) — Understand the boundaries
- [Hosting Options](/getting-started/hosting-options) — Choose your deployment model
- [Architecture Overview](/architecture/overview) — Technical deep-dive
