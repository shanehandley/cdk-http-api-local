import type { ApiRouteDefinition } from './parser/types'
import { default as Table } from 'cli-table'

export const printApiEndpointTable = (routes: ApiRouteDefinition[], port: number): void => {
  let table = new Table({
    head: ['METHOD', 'URL']
  })

  routes.forEach(route => {
    table.push(
      [route.method, `http://localhost:${port}${route.path}`],
    )
  })

  console.log(table.toString())
}
