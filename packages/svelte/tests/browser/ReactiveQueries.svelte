<script lang="ts">
import { setup } from './setup.js'

let { reactive } = $props();

let { userQuery, postQuery } = setup({ reactive })

let userId = 1
let users = $state(() => userQuery.query().where(user => (user.age || 0) > 10).get())
let userWithPosts = $state(() => userQuery.findById(userId, { with: { posts: true } }))

let postId = 1
let post = $state(() => postQuery.findById(postId))
let postWithUser = $state(() => postQuery.findById(postId, { with: { user: true } }))

let nullUser = $state(() => userQuery.findById(1000))

function updateUser() {
  userQuery.save([{
    id: 1,
    name: 'John',
    email: 'john@example.com',
    age: 30,
  }])
}
</script>


<div class="container">
  <div class="column">
    <h2>Users</h2>
    <button data-testid="update-user" class="update-button" onclick={updateUser}>
      Update User 1
    </button>

    <h3>All Users (age > 10)</h3>
    <pre data-testid="users">{JSON.stringify(users(), null, 2)}</pre>

    <h3>User {userId} with Posts</h3>
    <pre data-testid="user-with-posts">{JSON.stringify(userWithPosts(), null, 2)}</pre>

    <h3>User {1000} (not found)</h3>
    <pre data-testid="null-user">{JSON.stringify(nullUser(), null, 2)}</pre>
  </div>

  <div class="column">
    <h2>Posts</h2>

    <h3>Post {postId}</h3>
    <pre data-testid="post">{JSON.stringify(post(), null, 2)}</pre>

    <h3>Post {postId} with User</h3>
    <pre data-testid="post-with-user">{JSON.stringify(postWithUser(), null, 2)}</pre>
  </div>
  <style>
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
</div>



