import type { Component } from 'solid-js'
import { createMemo } from 'solid-js'
import { postQuery, userQuery } from './queries.js'

const App: Component = () => {
  const userId = 1
  const users = createMemo(() => userQuery.query().where(user => (user.age || 0) > 10).get())
  const userWithPosts = createMemo(() => userQuery.findById(userId, { with: { posts: true } }))

  const postId = 1
  const post = createMemo(() => postQuery.findById(postId))
  const postWithUser = createMemo(() => postQuery.findById(postId, { with: { user: true } }))

  function updateUser() {
    userQuery.save([{
      id: 1,
      name: 'John',
      email: 'john@example.com',
      age: 30,
    }])
  }

  return (
    <div class="grid grid-cols-2 gap-4">
      <div class="flex flex-col gap-4 p-4">
        <button
          class="border border-blue-500 cursor-pointer text-blue-500 p-1 rounded-md"
          onClick={updateUser}
        >
          Update user
        </button>
        Users
        <pre>{JSON.stringify(users(), null, 2)}</pre>
        User
        {' '}
        {userId}
        {' '}
        with posts
        <pre>{JSON.stringify(userWithPosts(), null, 2)}</pre>
      </div>

      <div class="flex flex-col gap-4 p-4">
        Post
        {' '}
        {postId}
        <pre>{JSON.stringify(post(), null, 2)}</pre>
        Post
        {' '}
        {postId}
        {' '}
        with user
        <pre>{JSON.stringify(postWithUser(), null, 2)}</pre>
      </div>
    </div>
  )
}

export default App
