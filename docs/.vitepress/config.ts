import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'zorm',
  description: 'A minimalist, type-safe ORM powered by Zod',
  themeConfig: {
    sidebar: [
      {
        text: 'Getting Started',
        items: [
          { text: 'Introduction', link: '/introduction' },
        ],
      },
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/joris-gallot/zorm' },
    ],
  },
})
