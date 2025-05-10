import { transformerTwoslash } from '@shikijs/vitepress-twoslash'
import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'zorm',
  description: 'A minimalist, type-safe ORM powered by Zod',
  themeConfig: {
    sidebar: [
      {
        text: 'Guide',
        items: [
          { text: 'Getting Started', link: '/guide/getting-started' },
          { text: 'Why?', link: '/guide/why' },
        ],
      },
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/joris-gallot/zorm' },
    ],
  },
  markdown: {
    codeTransformers: [
      transformerTwoslash(),
    ],
    languages: ['js', 'jsx', 'ts', 'tsx'],
  },
})
