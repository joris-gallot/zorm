<script setup lang="ts">
import { userQuery } from '@/queries'
import { computed } from 'vue'

const user = computed(() => userQuery.findById(1))
const userWithPosts = computed(() => userQuery.findById(1, { with: ['posts'] }))
</script>

<template>
  <div class="flex flex-col gap-4 p-4">
    User
    <pre>{{ user }}</pre>
    User with posts
    <pre>{{ userWithPosts }}</pre>
  </div>
</template>
