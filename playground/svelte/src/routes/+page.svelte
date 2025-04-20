<script lang="ts">
import { postQuery, userQuery } from '../lib/queries'

let userId = 1
let users = $state(() => userQuery.query().where(user => (user.age || 0) > 10).get())
let userWithPosts = $state(() => userQuery.findById(userId, { with: { posts: true } }))

let postId = 1;
let post = $state(() => postQuery.findById(postId))
let postWithUser = $state(() => postQuery.findById(postId, { with: { user: true } }))

function updateUser() {
  userQuery.save([{
    id: 1,
    name: 'John',
    email: 'john@example.com',
    age: 30,
  }])
}
</script>


<div class="grid grid-cols-2 gap-4">
  <div class="flex flex-col gap-4 p-4">
    <button class="border border-blue-500 cursor-pointer text-blue-500 p-1 rounded-md" onclick={updateUser}>
      Update user
    </button>
    Users
    <pre>{JSON.stringify(users(), null, 2)}</pre>
    User {userId} with posts
    <pre>{JSON.stringify(userWithPosts(), null, 2)}</pre>
  </div>

  <div class="flex flex-col gap-4 p-4">
    Post {postId}
    <pre>{JSON.stringify(post(), null, 2)}</pre>
    Post {postId} with user
    <pre>{JSON.stringify(postWithUser(), null, 2)}</pre>
  </div>
</div>