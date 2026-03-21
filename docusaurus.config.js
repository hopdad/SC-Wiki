import {themes as prismThemes} from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Meijer Supply Chain Wiki',
  tagline: 'Supply chain knowledge base and software documentation',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  url: 'https://sc-wiki.meijer.com',
  baseUrl: '/',

  organizationName: 'hopdad',
  projectName: 'SC-Wiki',

  onBrokenLinks: 'throw',

  // Supabase config — set these for your environment
  customFields: {
    supabaseUrl: process.env.SUPABASE_URL || 'https://your-project.supabase.co',
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY || 'your-anon-key',
  },

  markdown: {
    mermaid: true,
  },

  themes: ['@docusaurus/theme-mermaid'],

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          editUrl: 'https://github.com/hopdad/SC-Wiki/tree/main/',
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          editUrl: 'https://github.com/hopdad/SC-Wiki/tree/main/',
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      image: 'img/meijer-social-card.png',
      colorMode: {
        defaultMode: 'light',
        disableSwitch: false,
        respectPrefersColorScheme: true,
      },
      navbar: {
        title: 'Meijer SC Wiki',
        logo: {
          alt: 'Meijer Logo',
          src: 'img/logo.svg',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'supplyChainSidebar',
            position: 'left',
            label: 'Supply Chain',
          },
          {
            type: 'docSidebar',
            sidebarId: 'systemsSidebar',
            position: 'left',
            label: 'Systems',
          },
          {
            type: 'docSidebar',
            sidebarId: 'referenceSidebar',
            position: 'left',
            label: 'Reference',
          },
          {to: '/blog', label: 'Updates', position: 'left'},
          {
            href: 'https://github.com/hopdad/SC-Wiki',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Knowledge Base',
            items: [
              {label: 'Supply Chain', to: '/docs/supply-chain/overview'},
              {label: 'Systems', to: '/docs/systems/overview'},
              {label: 'Glossary', to: '/docs/reference/glossary'},
            ],
          },
          {
            title: 'Systems',
            items: [
              {label: 'WMS', to: '/docs/systems/wms/overview'},
              {label: 'TMS', to: '/docs/systems/tms/overview'},
              {label: 'Inventory', to: '/docs/systems/inventory-systems/overview'},
              {label: 'Integrations', to: '/docs/systems/integrations/overview'},
            ],
          },
          {
            title: 'More',
            items: [
              {label: 'Updates', to: '/blog'},
              {label: 'GitHub', href: 'https://github.com/hopdad/SC-Wiki'},
            ],
          },
        ],
        copyright: `Copyright \u00A9 ${new Date().getFullYear()} Meijer, Inc. Built with Docusaurus.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
    }),
};

export default config;
