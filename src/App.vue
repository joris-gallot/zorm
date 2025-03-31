<script setup lang="ts">
import { postQuery, userQuery } from '@/queries'
import { computed } from 'vue'

const userId = 1
const user = computed(() => userQuery.findById(userId))
const userWithPosts = computed(() => userQuery.findById(userId, { with: ['posts'] }))

const postId = 1
const post = computed(() => postQuery.findById(postId))
const postWithUser = computed(() => postQuery.findById(postId, { with: ['user'] }))
</script>

<template>
  <div class="grid grid-cols-2 gap-4">
    <div class="flex flex-col gap-4 p-4">
      User {{ userId }}
      <pre>{{ user }}</pre>
      User {{ userId }} with posts
      <pre>{{ userWithPosts }}</pre>
    </div>

    <div class="flex flex-col gap-4 p-4">
      Post {{ postId }}
      <pre>{{ post }}</pre>
      Post {{ postId }} with user
      <pre>{{ postWithUser }}</pre>
    </div>
  </div>
</template>
