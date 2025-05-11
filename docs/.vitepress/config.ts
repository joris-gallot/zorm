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
      {
        text: 'Reactivity',
        items: [
          { text: 'How it works', link: '/reactivity/how-it-works' },
          { text: 'SolidJS', link: '/reactivity/solidjs' },
          { text: 'Svelte', link: '/reactivity/svelte' },
          { text: 'Vue', link: '/reactivity/vue' },
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
