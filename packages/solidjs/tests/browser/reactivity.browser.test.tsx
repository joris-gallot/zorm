import { render } from '@solidjs/testing-library'
import { DefaultDatabase, defineReactivityDatabase, getDb } from '@zorm-ts/core'
import { beforeEach, describe, expect, it } from 'vitest'
import { SolidjsDatabase, useReactiveDatabase } from '../../src'
import ReactiveQueries from './ReactiveQueries'

describe('reactivity', async () => {
  beforeEach(() => {
    defineReactivityDatabase(new DefaultDatabase())
  })

  it('should not react to changes', async () => {
    const { getByTestId } = render(() => <ReactiveQueries reactive={false} />)

    const expectedUsers = [
      { id: 2, name: 'Jane', email: 'jane@doe.com', age: 20 },
      { id: 3, name: 'Jim', email: 'jim@beam.com', age: 30 },
    ]

    await expect(getByTestId('users').textContent).toBe(JSON.stringify(expectedUsers, null, 2))

    const expectedUserWithPosts = {
      id: 1,
      name: 'John',
      email: 'john@doe.com',
      age: 10,
      posts: [
        {
          id: 1,
          title: 'Post 1',
          userId: 1,
          imageId: 1,
        },
        {
          id: 2,
          title: 'Post 2',
          userId: 1,
          imageId: 2,
        },
      ],
    }

    await expect(getByTestId('user-with-posts').textContent).toBe(JSON.stringify(expectedUserWithPosts, null, 2))

    const expectedPostWithUser = {
      id: 1,
      title: 'Post 1',
      userId: 1,
      imageId: 1,
      user: {
        id: 1,
        name: 'John',
        email: 'john@doe.com',
        age: 10,
      },
    }

    await expect(getByTestId('post-with-user').textContent).toBe(JSON.stringify(expectedPostWithUser, null, 2))

    await getByTestId('update-user').click()

    await expect(getByTestId('users').textContent).toBe(JSON.stringify(expectedUsers, null, 2))

    await expect(getByTestId('user-with-posts').textContent).toBe(JSON.stringify(expectedUserWithPosts, null, 2))

    await expect(getByTestId('post-with-user').textContent).toBe(JSON.stringify(expectedPostWithUser, null, 2))
  })

  it('should react to changes', async () => {
    const { getByTestId } = render(() => <ReactiveQueries reactive={true} />)

    const expectedUsers = [
      { id: 2, name: 'Jane', email: 'jane@doe.com', age: 20 },
      { id: 3, name: 'Jim', email: 'jim@beam.com', age: 30 },
    ]

    await expect(getByTestId('users').textContent).toBe(JSON.stringify(expectedUsers, null, 2))

    const expectedUserWithPosts = {
      id: 1,
      name: 'John',
      email: 'john@doe.com',
      age: 10,
      posts: [
        {
          id: 1,
          title: 'Post 1',
          userId: 1,
          imageId: 1,
        },
        {
          id: 2,
          title: 'Post 2',
          userId: 1,
          imageId: 2,
        },
      ],
    }

    await expect(getByTestId('user-with-posts').textContent).toBe(JSON.stringify(expectedUserWithPosts, null, 2))

    const expectedPostWithUser = {
      id: 1,
      title: 'Post 1',
      userId: 1,
      imageId: 1,
      user: {
        id: 1,
        name: 'John',
        email: 'john@doe.com',
        age: 10,
      },
    }

    await expect(getByTestId('post-with-user').textContent).toBe(JSON.stringify(expectedPostWithUser, null, 2))

    await getByTestId('update-user').click()

    const updatedUsers = [
      { id: 1, name: 'John', email: 'john@example.com', age: 30 },
      { id: 2, name: 'Jane', email: 'jane@doe.com', age: 20 },
      { id: 3, name: 'Jim', email: 'jim@beam.com', age: 30 },
    ]

    await expect(getByTestId('users').textContent).toBe(JSON.stringify(updatedUsers, null, 2))

    const updatedUserWithPosts = {
      id: 1,
      name: 'John',
      email: 'john@example.com',
      age: 30,
      posts: [
        {
          id: 1,
          title: 'Post 1',
          userId: 1,
          imageId: 1,
        },
        {
          id: 2,
          title: 'Post 2',
          userId: 1,
          imageId: 2,
        },
      ],
    }

    await expect(getByTestId('user-with-posts').textContent).toBe(JSON.stringify(updatedUserWithPosts, null, 2))

    const updatedPostWithUser = {
      id: 1,
      title: 'Post 1',
      userId: 1,
      imageId: 1,
      user: {
        id: 1,
        name: 'John',
        email: 'john@example.com',
        age: 30,
      },
    }

    await expect(getByTestId('post-with-user').textContent).toBe(JSON.stringify(updatedPostWithUser, null, 2))
  })

  it('should update db instance', async () => {
    expect(getDb()).toBeInstanceOf(DefaultDatabase)
    useReactiveDatabase()
    expect(getDb()).toBeInstanceOf(SolidjsDatabase)
  })
})
