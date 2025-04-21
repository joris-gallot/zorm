import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-vue'
import Database from './Database.vue'

describe('render database', async () => {
  it('should render database', async () => {
    const { getByTestId } = render(Database)

    const expectedUsers = [
      { id: 2, name: 'Jane', email: 'jane@doe.com', age: 20 },
      { id: 3, name: 'Jim', email: 'jim@beam.com', age: 30 },
    ]

    await expect(getByTestId('users').element().textContent).toBe(JSON.stringify(expectedUsers, null, 2))

    await getByTestId('update-user').click()

    const updatedUsers = [
      { id: 1, name: 'John', email: 'john@example.com', age: 30 },
      { id: 2, name: 'Jane', email: 'jane@doe.com', age: 20 },
      { id: 3, name: 'Jim', email: 'jim@beam.com', age: 30 },
    ]

    await expect(getByTestId('users').element().textContent).toBe(JSON.stringify(updatedUsers, null, 2))
  })
})
