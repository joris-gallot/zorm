import type { Component } from 'solid-js'
import { createMemo } from 'solid-js'
import { setup } from './setup.js'
import './ReactiveQueries.css'

interface ReactiveQueriesProps {
  reactive: boolean
}

const ReactiveQueries: Component<ReactiveQueriesProps> = ({ reactive }: ReactiveQueriesProps) => {
  const { userQuery, postQuery } = setup({ reactive })

  const userId = 1
  const postId = 1

  const users = createMemo(() => userQuery.query().where((user: { age?: number }) => (user.age || 0) > 10).get())
  const userWithPosts = createMemo(() => userQuery.findById(userId, { with: { posts: true } }))
  const post = createMemo(() => postQuery.findById(postId))
  const postWithUser = createMemo(() => postQuery.findById(postId, { with: { user: true } }))
  const nullUser = createMemo(() => userQuery.findById(1000))

  function updateUser() {
    userQuery.save([{
      id: 1,
      name: 'John',
      email: 'john@example.com',
      age: 30,
    }])
  }

  return (
    <div class="container">
      <div class="column">
        <h2>Users</h2>
        <button data-testid="update-user" class="update-button" onClick={updateUser}>
          Update User 1
        </button>

        <h3>
          All Users (age
          {'>'}
          {' '}
          10)
        </h3>
        <pre data-testid="users">{JSON.stringify(users(), null, 2)}</pre>

        <h3>
          User
          {userId}
          {' '}
          with Posts
        </h3>
        <pre data-testid="user-with-posts">{JSON.stringify(userWithPosts(), null, 2)}</pre>

        <h3>User 1000 (not found)</h3>
        <pre data-testid="null-user">{JSON.stringify(nullUser(), null, 2)}</pre>
      </div>

      <div class="column">
        <h2>Posts</h2>

        <h3>
          Post
          {postId}
        </h3>
        <pre data-testid="post">{JSON.stringify(post(), null, 2)}</pre>

        <h3>
          Post
          {postId}
          {' '}
          with User
        </h3>
        <pre data-testid="post-with-user">{JSON.stringify(postWithUser(), null, 2)}</pre>
      </div>
    </div>
  )
}

export default ReactiveQueries
