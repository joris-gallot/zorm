import { createApp } from 'vue'

import App from './App.vue'
import { userQueryBuilder } from './queries'
import './style.css'

const app = createApp(App)

userQueryBuilder.save([{
  id: 1,
  firstName: 'John',
  lastName: 'Doe',
  age: 10,
  posts: [],
}, {
  id: 2,
  firstName: 'Jane',
  lastName: 'Doe',
  age: 20,
}, {
  id: 3,
  firstName: 'Jim',
  lastName: 'Beam',
  age: 30,
}])

app.mount('#app')
