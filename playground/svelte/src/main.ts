import { useReactiveDatabase } from '@zorm-ts/svelte'
import { postQuery, userQuery } from './lib/queries'

useReactiveDatabase()

postQuery.save([{
  id: 1,
  title: 'Post 1',
  userId: 1,
  imageId: 1,
}, {
  id: 2,
  title: 'Post 2',
  userId: 1,
  imageId: 2,
}, {
  id: 3,
  title: 'Post 3',
  userId: 2,
  imageId: 3,
  user: {
    id: 2,
    name: 'Jane',
    email: 'jane@doe.com',
    age: 20,
  },
}])

userQuery.save([
  {
    id: 1,
    name: 'John',
    email: 'john@doe.com',
    age: 10,
    posts: [
      {
        id: 2,
        title: 'Post 2',
        userId: 1,
        imageId: 2,
      },
    ],
  },
  {
    id: 2,
    name: 'Jane',
    email: 'jane@doe.com',
    age: 20,
  },
  {
    id: 3,
    name: 'Jim',
    email: 'jim@beam.com',
    age: 30,
  },
])
