---
outline: deep
---

# How It Works

Zorm provides dedicated packages for popular frameworks to enable seamless reactivity integration, each integration package is designed to work with the framework's native reactivity system.

Each integration package provides a thin layer that connects Zorm's query system with the framework's reactivity system. When you initialize the reactive database:

1. The integration sets up the necessary reactivity hooks and listeners
2. Any queries executed through the query builder will automatically trigger reactivity updates
3. Components using the query results will re-render when the underlying data changes
