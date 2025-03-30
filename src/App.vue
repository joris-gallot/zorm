<script setup lang="ts">
import { userQueryBuilder } from '@/queries'
import { computed } from 'vue'

const user = computed(() => userQueryBuilder.find(1, { with: ['posts'] }))
</script>

<template>
  <pre class="p-4">{{ user }}</pre>
</template>
