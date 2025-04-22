<script setup lang="ts">
import { computed } from 'vue'
import { setup } from './setup.js'

const { reactive } = defineProps<{
  reactive: boolean
}>()

const { userQuery, postQuery } = setup({ reactive })

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
  <div class="container">
    <div class="column">
      <h2>Users</h2>
      <button data-testid="update-user" class="update-button" @click="updateUser">
        Update User 1
      </button>

      <h3>All Users (age > 10)</h3>
      <pre data-testid="users">{{ users }}</pre>

      <h3>User {{ userId }} with Posts</h3>
      <pre data-testid="user-with-posts">{{ userWithPosts }}</pre>
    </div>

    <div class="column">
      <h2>Posts</h2>

      <h3>Post {{ postId }}</h3>
      <pre data-testid="post">{{ post }}</pre>

      <h3>Post {{ postId }} with User</h3>
      <pre data-testid="post-with-user">{{ postWithUser }}</pre>
    </div>
  </div>
</template>

<style scoped>
.container {
  display: flex;
  gap: 1rem;
}

.column {
  flex: 1;
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.update-button {
  border: 1px solid blue;
  color: blue;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  margin-bottom: 1rem;
}

pre {
  background-color: #f5f5f5;
  padding: 0.5rem;
  border-radius: 4px;
  overflow-x: auto; /* Handle long lines */
}
</style>
