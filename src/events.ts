import type { APIGatewayProxyEventQueryStringParameters, APIGatewayProxyEventV2 } from 'aws-lambda'
import type { Request } from 'express'
import { ExecutionOptions } from 'lambda-local'

export type LambdaResult = {
  statusCode: number
  body: string
  headers?: {
    [key: string]: string
  }
}

export const asHttpEventBody = (body: { [key: string]: any }, headers = {}) =>
(({
  headers,
  body,
} as unknown) as APIGatewayProxyEventV2)

export const buildAPIGatewayV2Event = (
  fnPath: string,
  env: { [key: string]: string },
  req: Request
): ExecutionOptions => ({
  lambdaPath: fnPath,
  lambdaHandler: 'default',
  environment: env,
  timeoutMs: 8000,
  event: {
    body: req.body,
    queryStringParameters: req.query as APIGatewayProxyEventQueryStringParameters,
  },
})
