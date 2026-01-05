<h1 style="display: flex; align-items: center; gap: 8px;">
  <span>cluster</span>
  <img src="packages/web/assets/logo.png" width="64" />
</h1>

**Open-source research synthesis with complete data ownership.**

Cluster is a W3C Web Annotation-compliant platform that gives UX research teams the power of tools like Dovetail—with your files staying in your cloud and annotations in open standards.

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![Documentation](https://img.shields.io/badge/docs-cluster--research--solutions.github.io-blue)](https://cluster-research-solutions.github.io/cluster/)

## Why Cluster?

Research data is valuable. It represents hours of interviews, usability tests, and customer conversations. Yet most research tools lock this data in proprietary formats on vendor-controlled infrastructure.

**Cluster is different:**

- **Your files stay in your cloud** — SharePoint, OneDrive, or Google Drive (coming soon)
- **Annotations use open standards** — W3C Web Annotation format, not proprietary schemas
- **Your database, your control** — Self-host on your infrastructure
- **No vendor lock-in** — Export everything, import anywhere

## Features

- **Annotation & Synthesis** — Highlight text, create video/audio clips, tag with custom taxonomies
- **Affinity Mapping** — Visual canvas for grouping and organizing findings
- **Research Insights** — Create evidence-backed insights linked to supporting data
- **W3C Compliance** — Full JSON-LD export compatible with other annotation tools
- **Enterprise Ready** — Azure AD authentication, multi-tenant support, role-based access

## Documentation

**[View Full Documentation →](https://cluster-research-solutions.github.io/cluster/)**

- [Getting Started](https://cluster-research-solutions.github.io/cluster/)
- [Self-Hosting Guide](https://cluster-research-solutions.github.io/cluster/self-hosting/requirements)
- [API Reference](https://cluster-research-solutions.github.io/cluster/api/overview)
- [Azure AD Setup](https://cluster-research-solutions.github.io/cluster/authentication/azure-setup)

## Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL 14+
- pnpm 8+
- Azure AD tenant (for authentication)

### Installation

```bash
# Clone the repository
git clone https://github.com/cluster-research-solutions/cluster.git
cd cluster

# Install dependencies
pnpm install

# Build shared package
pnpm --filter @cluster/shared build

# Configure environment
cp .env.example .env
cp packages/web/.env.example packages/web/.env
# Edit .env files with your Azure AD credentials

# Set up database
pnpm --filter @cluster/server db:migrate

# Start development servers
pnpm dev
```

The web app will be available at http://localhost:3000 and the API at http://localhost:4000.

## Project Structure

```
cluster/
├── packages/
│   ├── shared/          # TypeScript types and Zod schemas
│   ├── server/          # Express API server
│   └── web/             # React frontend (Vite)
├── docs/                # Docusaurus documentation
└── docker-compose.yml   # Production deployment
```

## Technology Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React, TypeScript, Vite, Tailwind CSS |
| **Backend** | Node.js, Express, TypeScript |
| **Database** | PostgreSQL, Drizzle ORM |
| **Auth** | Azure AD (MSAL.js) |
| **File Storage** | SharePoint (Microsoft Graph API) |

## Standards

Cluster implements the W3C Web Annotation specification:

- [Web Annotation Data Model](https://www.w3.org/TR/annotation-model/)
- [Web Annotation Protocol](https://www.w3.org/TR/annotation-protocol/)
- [Media Fragments URI](https://www.w3.org/TR/media-frags/)

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting a pull request.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## Support

- [GitHub Issues](https://github.com/cluster-research-solutions/cluster/issues) — Report bugs, request features
- [GitHub Discussions](https://github.com/cluster-research-solutions/cluster/discussions) — Ask questions, share ideas
