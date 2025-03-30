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
    firstName: 'John',
    lastName: 'Doe',
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
    firstName: 'Jane',
    lastName: 'Doe',
    age: 20,
  },
  {
    id: 3,
    firstName: 'Jim',
    lastName: 'Beam',
    age: 30,
  },
])

app.mount('#app')
