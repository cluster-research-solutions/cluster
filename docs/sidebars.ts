import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docsSidebar: [
    {
      type: 'category',
      label: 'Getting Started',
      collapsed: false,
      items: [
        'getting-started/introduction',
        'getting-started/what-is-cluster',
        'getting-started/what-cluster-is-not',
        'getting-started/hosting-options',
      ],
    },
    {
      type: 'category',
      label: 'Architecture',
      items: [
        'architecture/overview',
        'architecture/tech-stack',
        'architecture/data-model',
      ],
    },
    {
      type: 'category',
      label: 'Self-Hosting',
      items: [
        'self-hosting/requirements',
        'self-hosting/installation',
        'self-hosting/configuration',
        'self-hosting/running',
      ],
    },
    {
      type: 'category',
      label: 'Authentication',
      items: [
        'authentication/overview',
        'authentication/azure-setup',
        'authentication/google-setup',
      ],
    },
  ],
  apiSidebar: [
    {
      type: 'category',
      label: 'API Reference',
      collapsed: false,
      items: [
        'api/overview',
        'api/authentication',
        'api/annotations',
        'api/w3c-export',
        'api/files',
        'api/studies',
        'api/clusters',
      ],
    },
  ],
};

export default sidebars;
