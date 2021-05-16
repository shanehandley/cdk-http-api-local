import express from 'express'
import * as lambda from 'lambda-local'
import { ApiGatewayV2HttpApiParser } from "./parser/apigwv2HttpApi"
import { asQueryString, LambdaResult } from './events'

const DEFAULT_PORT = 7887

export interface Config {
  templatePath: string
  lambdaFileExtension: 'ts' | 'js'
  port?: number
}

export const apigwv2HttpApi = async (config: Config) => {
  const parser = new ApiGatewayV2HttpApiParser(config.templatePath)
  const api = await parser.parse()

  const server = express()

  api.routes?.map(async ({ method, path, fnPath, env }) => {
    switch (method) {
      case 'GET':
        server.get(path, async (req, res) => {
          try {
            const { queryStringParameters } = asQueryString(req.query)

            const result = await lambda.execute({
              lambdaPath: fnPath,
              lambdaHandler: 'default',
              environment: env,
              timeoutMs: 5000,
              event: {
                queryStringParameters,
              }
            }) as LambdaResult

            const { statusCode, body, headers } = result

            if (headers) {
              Object.keys(headers).forEach((key) => res.setHeader(key, headers[key]))
            }

            res.status(statusCode).send(body)
          } catch (error) {
            res.status(500).send(error)
          }
        })
    }
  })

  server.listen((config.port || DEFAULT_PORT).toString(), () => {
    console.log(`⚡️[server]: Server is running at https://localhost:${config.port || DEFAULT_PORT}}`)
  })
}
