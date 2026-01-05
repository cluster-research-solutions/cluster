import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Cluster',
  tagline: 'Open-source research synthesis with complete data ownership',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  // GitHub Pages deployment
  url: 'https://cluster-research-solutions.github.io',
  baseUrl: '/cluster/',

  organizationName: 'cluster-research-solutions',
  projectName: 'cluster',
  deploymentBranch: 'gh-pages',
  trailingSlash: false,

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/cluster-research-solutions/cluster/tree/main/docs/',
          routeBasePath: '/', // Docs at root
        },
        blog: false, // Disable blog
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/logo.png',
    colorMode: {
      defaultMode: 'light',
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'cluster',
      logo: {
        alt: 'Cluster Logo',
        src: 'img/logo.png',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docsSidebar',
          position: 'left',
          label: 'Documentation',
        },
        {
          type: 'docSidebar',
          sidebarId: 'apiSidebar',
          position: 'left',
          label: 'API Reference',
        },
        {
          href: 'https://github.com/cluster-research-solutions/cluster',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Documentation',
          items: [
            {
              label: 'Getting Started',
              to: '/',
            },
            {
              label: 'Self-Hosting',
              to: '/self-hosting/requirements',
            },
            {
              label: 'API Reference',
              to: '/api/overview',
            },
          ],
        },
        {
          title: 'Standards',
          items: [
            {
              label: 'W3C Web Annotation',
              href: 'https://www.w3.org/TR/annotation-model/',
            },
            {
              label: 'Media Fragments URI',
              href: 'https://www.w3.org/TR/media-frags/',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/cluster-research-solutions/cluster',
            },
            {
              label: 'Issues',
              href: 'https://github.com/cluster-research-solutions/cluster/issues',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Cluster. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'json', 'typescript', 'sql'],
    },
    tableOfContents: {
      minHeadingLevel: 2,
      maxHeadingLevel: 4,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
