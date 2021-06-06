import express, { Request, Response, Express, IRouterMatcher } from 'express'
import * as lambda from 'lambda-local'
import { json } from 'body-parser'
import { ApiGatewayV2HttpApiParser } from './parser/apigwv2HttpApi'
import { asQueryString, LambdaResult } from './events'

const DEFAULT_PORT = 7887

export interface Config {
  templatePath: string
  lambdaFileExtension: 'ts' | 'js'
  port?: number
}

const handle = (
  server: Express,
  httpMethod: string
): IRouterMatcher<unknown> => {
  switch (httpMethod) {
    case 'POST':
      return server.post
    case 'PUT':
      return server.put
    case 'GET':
      return server.get
    case 'DELETE':
      return server.delete
    default:
      throw new Error(`Unknown method ${httpMethod}`)
  }
}

export const apigwv2HttpApi = async (config: Config) => {
  const parser = new ApiGatewayV2HttpApiParser(config.templatePath)
  const api = await parser.parse()

  const server = express()
  server.use(json())

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

    handle(server, method)(path, handler)
  })

  const port = config.port || DEFAULT_PORT

  server.listen(port.toString(), () => {
    console.log(`⚡️[server]: Server is running at https://localhost:${port}}`)
  })
}
