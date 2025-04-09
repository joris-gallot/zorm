import type { ObjectWithId } from './orm'

export type OrderByCriteria<T> = Array<keyof T | ((item: T) => unknown)>
export type OrderByOrders = Array<'asc' | 'desc'>

export function compareValues<T>(a: T, b: T, order: 'asc' | 'desc'): 0 | -1 | 1 {
  if ((a === undefined || a === null) && (b === undefined || b === null)) {
    return 0
  }
  if (a === undefined || a === null) {
    return order === 'asc' ? 1 : -1
  }
  if (b === undefined || b === null) {
    return order === 'asc' ? -1 : 1
  }

  if (a < b) {
    return order === 'asc' ? -1 : 1
  }
  if (a > b) {
    return order === 'asc' ? 1 : -1
  }
  return 0
}

export function orderBy<T extends ObjectWithId>(
  { criteria, orders }: { criteria: OrderByCriteria<T>, orders: OrderByOrders },
): (a: T, b: T) => 0 | -1 | 1 {
  return (a, b) => {
    const ordersLength = orders.length

    for (let i = 0; i < criteria.length; i++) {
      const order = (ordersLength > i ? orders[i] : orders[ordersLength - 1]) ?? 'asc'
      const criterion = criteria[i]
      const criterionIsFunction = typeof criterion === 'function'

      const valueA = criterionIsFunction ? criterion(a) : a[criterion as keyof T]
      const valueB = criterionIsFunction ? criterion(b) : b[criterion as keyof T]

      const result = compareValues(valueA, valueB, order)

      if (result !== 0) {
        return result
      }
    }

    return 0
  }
}
