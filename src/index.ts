import express, { Request, Response } from 'express'
import * as lambda from 'lambda-local'
import { json } from 'body-parser'
import { printApiEndpointTable } from './utils'
import { ApiGatewayV2HttpApiParser, HttpMethod } from './parser'
import { buildAPIGatewayV2Event, LambdaResult } from './events'

const DEFAULT_PORT = 7887

export interface Config {
  templatePath: string
  lambdaFileExtension: 'ts' | 'js'
  port?: number,
  logger?: {
    transports: string[]
  }
}

export const apigwv2HttpApi = async (config: Config) => {
  const parser = new ApiGatewayV2HttpApiParser(config)
  const api = await parser.parse()

  const server = express().use(json())

  api.routes?.map(async ({ method, path, fnPath, env }) => {
    const handler = async (req: Request, res: Response) => {
      try {
        const result = (await lambda.execute(buildAPIGatewayV2Event(fnPath, env, req))) as LambdaResult

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
