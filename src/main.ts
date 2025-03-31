import { createApp } from 'vue'

import App from './App.vue'
import { postQuery, userQuery } from './queries'
import './style.css'

const app = createApp(App)

postQuery.save([{
  id: 1,
  title: 'Post 1',
  userId: 1,
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

app.mount('#app')
