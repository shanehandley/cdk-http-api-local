import express, { Request, Response } from 'express'
import * as lambda from 'lambda-local'
import { default as Table } from 'cli-table'
import { json } from 'body-parser'
import { ApiGatewayV2HttpApiParser, ApiRouteDefinition } from './parser'
import { asQueryString, LambdaResult } from './events'

const DEFAULT_PORT = 7887

export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE'
}

export interface Config {
  templatePath: string
  lambdaFileExtension: 'ts' | 'js'
  port?: number
}

const printApiEndpointTable = (routes: ApiRouteDefinition[], port: number): void => {
  let table = new Table({
    head: ['METHOD', 'URL', 'Fn']
  })

  routes.forEach(route => {
    table.push(
      [route.method, `http://localhost:${port}${route.path}`, route.fnPath],
    )
  })

  console.log(table.toString())
}

export const apigwv2HttpApi = async (config: Config) => {
  const parser = new ApiGatewayV2HttpApiParser(config.templatePath)
  const api = await parser.parse()

  const server = express().use(json())

  api.routes?.map(async ({ method, path, fnPath, env }) => {
    const handler = async (req: Request, res: Response) => {
      try {
        const result = (await lambda.execute({
          lambdaPath: fnPath,
          lambdaHandler: 'default',
          environment: env,
          timeoutMs: 5000,
          event: {
            body: req.body,
            queryStringParameters: asQueryString(req.query),
          },
        })) as LambdaResult

        const { statusCode, body, headers } = result

        if (headers) {
          Object.keys(headers).forEach(key => res.setHeader(key, headers[key]))
        }

        res.status(statusCode).send(body)
      } catch (error) {
        res.status(500).send(error)
      }
    }

    try {
      switch (method) {
        case HttpMethod.POST:
          return server.post(path, handler)
        case HttpMethod.PUT:
          return server.put(path, handler)
        case HttpMethod.GET:
          return server.get(path, handler)
        case HttpMethod.DELETE:
          return server.delete(path, handler)
        default:
          throw new Error(`Unknown method ${method}`)
      }
    } catch (e) {
      console.error('cdk-http-api-local error: ', e)
      return
    }
  })

  const port = config.port || DEFAULT_PORT

  server.listen(port.toString(), () => {
    console.log(`⚡️[server]: Server is running at https://localhost:${port}}`)

    printApiEndpointTable(api.routes || [], port)
  })
}
