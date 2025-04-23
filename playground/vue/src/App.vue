<script setup lang="ts">
import { computed } from 'vue'
import { postQuery, userQuery } from './queries.js'

const userId = 1
const users = computed(() => userQuery.query().where(user => (user.age || 0) > 10).get())
const userWithPosts = computed(() => userQuery.findById(userId, { with: { posts: true } }))

const postId = 1
const post = computed(() => postQuery.findById(postId))
const postWithUser = computed(() => postQuery.findById(postId, { with: { user: true } }))

function updateUser() {
  userQuery.save([{
    id: 1,
    name: 'John',
    email: 'john@example.com',
    age: 30,
  }])
}
</script>

<template>
  <div class="grid grid-cols-2 gap-4">
    <div class="flex flex-col gap-4 p-4">
      <button class="border border-blue-500 cursor-pointer text-blue-500 p-1 rounded-md" @click="updateUser">
        Update user
      </button>
      Users
      <pre>{{ users }}</pre>
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
