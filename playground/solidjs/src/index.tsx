import { useReactiveDatabase } from '@zorm-ts/solidjs'

/* @refresh reload */
import { render } from 'solid-js/web'
import App from './App'
import { postQuery, userQuery } from './queries'
import './index.css'

const root = document.getElementById('root')

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    'Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?',
  )
}

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

render(() => <App />, root!)
