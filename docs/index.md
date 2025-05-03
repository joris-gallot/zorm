---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "zorm"
  text: "A minimalist, type-safe ORM powered by Zod"
  tagline: Define and manipulate entities in a simple and type-safe way, with intuitive relation management
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: API Reference
      link: /api-examples

features:
  - icon: 🛡️
    title: Type-Safe Schema Definition
    details: Leverage Zod's powerful type system to define and validate your entities with full TypeScript support
  - icon: 🔍
    title: Intuitive Query Builder
    details: Build complex queries with full type safety, including autocomplete for relations and inferred return types
  - icon: 🤝
    title: Flexible Relations
    details: Support for one-to-one, one-to-many and many-to-many relationships with easy eager loading
  - icon: ⚡
    title: Reactivity support
    details: Seamless integration with popular frameworks through dedicated packages for SolidJS, Svelte, and Vue
---
