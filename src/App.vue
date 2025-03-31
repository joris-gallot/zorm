<script setup lang="ts">
import { postQuery, userQuery } from '@/queries'
import { computed } from 'vue'

const user = computed(() => userQuery.findById(1))
const userWithPosts = computed(() => userQuery.findById(1, { with: ['posts'] }))

const post = computed(() => postQuery.findById(1))
const postWithUser = computed(() => postQuery.findById(1, { with: ['user'] }))
</script>

<template>
  <div class="grid grid-cols-2 gap-4">
    <div class="flex flex-col gap-4 p-4">
      User
      <pre>{{ user }}</pre>
      User with posts
      <pre>{{ userWithPosts }}</pre>
    </div>

    <div class="flex flex-col gap-4 p-4">
      Post
      <pre>{{ post }}</pre>
      Post with user
      <pre>{{ postWithUser }}</pre>
    </div>
  </div>
</template>
