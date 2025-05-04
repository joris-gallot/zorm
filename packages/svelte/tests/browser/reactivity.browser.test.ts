import { DefaultDatabase, defineDatabase, getDb, LOCAL_STORAGE_KEY } from '@zorm-ts/core'
import { beforeEach, describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-svelte'
import { SvelteDatabase, useReactiveDatabase } from '../../src'
import ReactiveQueries from './ReactiveQueries.svelte'
import { defaultDbData } from './setup'

describe('reactivity', async () => {
  beforeEach(() => {
    defineDatabase(new DefaultDatabase())
  })

  it('should update db instance', async () => {
    expect(getDb()).toBeInstanceOf(DefaultDatabase)
    useReactiveDatabase()
    expect(getDb()).toBeInstanceOf(SvelteDatabase)
  })

  it('should not react to changes', async () => {
    const { getByTestId } = render(ReactiveQueries, {
      props: {
        reactive: false,
      },
    })

    const expectedUsers = [
      { id: 2, name: 'Jane', email: 'jane@doe.com', age: 20 },
      { id: 3, name: 'Jim', email: 'jim@beam.com', age: 30 },
    ]

    await expect(getByTestId('users').element().textContent).toBe(JSON.stringify(expectedUsers, null, 2))

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

    await expect(getByTestId('user-with-posts').element().textContent).toBe(JSON.stringify(expectedUserWithPosts, null, 2))

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

    await expect(getByTestId('post-with-user').element().textContent).toBe(JSON.stringify(expectedPostWithUser, null, 2))

    await getByTestId('update-user').click()

    await expect(getByTestId('users').element().textContent).toBe(JSON.stringify(expectedUsers, null, 2))

    await expect(getByTestId('user-with-posts').element().textContent).toBe(JSON.stringify(expectedUserWithPosts, null, 2))

    await expect(getByTestId('post-with-user').element().textContent).toBe(JSON.stringify(expectedPostWithUser, null, 2))
  })

  it('should react to changes', async () => {
    const { getByTestId } = render(ReactiveQueries, {
      props: {
        reactive: true,
      },
    })

    const expectedUsers = [
      { id: 2, name: 'Jane', email: 'jane@doe.com', age: 20 },
      { id: 3, name: 'Jim', email: 'jim@beam.com', age: 30 },
    ]

    await expect(getByTestId('users').element().textContent).toBe(JSON.stringify(expectedUsers, null, 2))

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

    await expect(getByTestId('user-with-posts').element().textContent).toBe(JSON.stringify(expectedUserWithPosts, null, 2))

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

    await expect(getByTestId('post-with-user').element().textContent).toBe(JSON.stringify(expectedPostWithUser, null, 2))

    await getByTestId('update-user').click()

    const updatedUsers = [
      { id: 1, name: 'John', email: 'john@example.com', age: 30 },
      { id: 2, name: 'Jane', email: 'jane@doe.com', age: 20 },
      { id: 3, name: 'Jim', email: 'jim@beam.com', age: 30 },
    ]

    await expect(getByTestId('users').element().textContent).toBe(JSON.stringify(updatedUsers, null, 2))

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

    await expect(getByTestId('user-with-posts').element().textContent).toBe(JSON.stringify(updatedUserWithPosts, null, 2))

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

    await expect(getByTestId('post-with-user').element().textContent).toBe(JSON.stringify(updatedPostWithUser, null, 2))
  })

  describe('local storage', () => {
    beforeEach(() => {
      localStorage.removeItem(LOCAL_STORAGE_KEY)
    })

    it('should react to changes', async () => {
      const { getByTestId } = render(ReactiveQueries, {
        props: {
          reactive: true,
          databaseOptions: {
            localStorage: true,
          },
        },
      })

      let localStorageData = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)!)
      await expect(localStorageData).toEqual(defaultDbData)

      const expectedUsers = [
        { id: 2, name: 'Jane', email: 'jane@doe.com', age: 20 },
        { id: 3, name: 'Jim', email: 'jim@beam.com', age: 30 },
      ]

      await expect(getByTestId('users').element().textContent).toBe(JSON.stringify(expectedUsers, null, 2))

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

      await expect(getByTestId('user-with-posts').element().textContent).toBe(JSON.stringify(expectedUserWithPosts, null, 2))

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

      await expect(getByTestId('post-with-user').element().textContent).toBe(JSON.stringify(expectedPostWithUser, null, 2))

      await getByTestId('update-user').click()

      const updatedLocalStorageData = {
        image: {},
        post: {
          1: {
            id: 1,
            title: 'Post 1',
            userId: 1,
            imageId: 1,
          },
          2: {
            id: 2,
            title: 'Post 2',
            userId: 1,
            imageId: 2,
          },
          3: {
            id: 3,
            title: 'Post 3',
            userId: 2,
            imageId: 3,
          },
        },
        user: {
          1: {
            id: 1,
            name: 'John',
            email: 'john@example.com',
            age: 30,
          },
          2: {
            id: 2,
            name: 'Jane',
            email: 'jane@doe.com',
            age: 20,
          },
          3: {
            id: 3,
            name: 'Jim',
            email: 'jim@beam.com',
            age: 30,
          },
        },
      }

      localStorageData = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)!)
      await expect(localStorageData).toEqual(updatedLocalStorageData)

      const updatedUsers = [
        { id: 1, name: 'John', email: 'john@example.com', age: 30 },
        { id: 2, name: 'Jane', email: 'jane@doe.com', age: 20 },
        { id: 3, name: 'Jim', email: 'jim@beam.com', age: 30 },
      ]

      await expect(getByTestId('users').element().textContent).toBe(JSON.stringify(updatedUsers, null, 2))

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

      await expect(getByTestId('user-with-posts').element().textContent).toBe(JSON.stringify(updatedUserWithPosts, null, 2))

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

      await expect(getByTestId('post-with-user').element().textContent).toBe(JSON.stringify(updatedPostWithUser, null, 2))
    })

    it('should react to changes when initialized from local storage', async () => {
      const { getByTestId } = render(ReactiveQueries, {
        props: {
          reactive: true,
          initFromLocalStorage: true,
          databaseOptions: {
            localStorage: true,
          },
        },
      })

      let localStorageData = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)!)
      await expect(localStorageData).toEqual(defaultDbData)

      const expectedUsers = [
        { id: 2, name: 'Jane', email: 'jane@doe.com', age: 20 },
        { id: 3, name: 'Jim', email: 'jim@beam.com', age: 30 },
      ]

      await expect(getByTestId('users').element().textContent).toBe(JSON.stringify(expectedUsers, null, 2))

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

      await expect(getByTestId('user-with-posts').element().textContent).toBe(JSON.stringify(expectedUserWithPosts, null, 2))

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

      await expect(getByTestId('post-with-user').element().textContent).toBe(JSON.stringify(expectedPostWithUser, null, 2))

      await getByTestId('update-user').click()

      const updatedLocalStorageData = {
        image: {},
        post: {
          1: {
            id: 1,
            title: 'Post 1',
            userId: 1,
            imageId: 1,
          },
          2: {
            id: 2,
            title: 'Post 2',
            userId: 1,
            imageId: 2,
          },
          3: {
            id: 3,
            title: 'Post 3',
            userId: 2,
            imageId: 3,
          },
        },
        user: {
          1: {
            id: 1,
            name: 'John',
            email: 'john@example.com',
            age: 30,
          },
          2: {
            id: 2,
            name: 'Jane',
            email: 'jane@doe.com',
            age: 20,
          },
          3: {
            id: 3,
            name: 'Jim',
            email: 'jim@beam.com',
            age: 30,
          },
        },
      }

      localStorageData = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)!)
      await expect(localStorageData).toEqual(updatedLocalStorageData)

      const updatedUsers = [
        { id: 1, name: 'John', email: 'john@example.com', age: 30 },
        { id: 2, name: 'Jane', email: 'jane@doe.com', age: 20 },
        { id: 3, name: 'Jim', email: 'jim@beam.com', age: 30 },
      ]

      await expect(getByTestId('users').element().textContent).toBe(JSON.stringify(updatedUsers, null, 2))

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

      await expect(getByTestId('user-with-posts').element().textContent).toBe(JSON.stringify(updatedUserWithPosts, null, 2))

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

      await expect(getByTestId('post-with-user').element().textContent).toBe(JSON.stringify(updatedPostWithUser, null, 2))
    })

    it('should update db instance', async () => {
      expect(getDb()).toBeInstanceOf(DefaultDatabase)
      useReactiveDatabase()
      expect(getDb()).toBeInstanceOf(SvelteDatabase)
    })
  })
})
