import type { APIGatewayProxyEventQueryStringParameters, APIGatewayProxyEventV2 } from 'aws-lambda'
import type { Request } from 'express'

export interface LambdaLocalExecutionOptions {
  event: {
    [key: string]: any
  };
  lambdaPath?: string
  lambdaFunc?: string
  profilePath?: string
  profileName?: string
  lambdaHandler?: string
  region?: string
  timeoutMs?: number
  environment?: {
    [key: string]: string
  };
  envfile?: string
  envdestroy?: boolean
  verboseLevel?: number
  callback?: (_err: any, _done: any) => void
  clientContext?: string
}

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
): LambdaLocalExecutionOptions => ({
  lambdaPath: fnPath,
  environment: env,
  timeoutMs: 8000,
  event: {
    body: req.body,
    queryStringParameters: req.query as APIGatewayProxyEventQueryStringParameters,
  },
  verboseLevel: 1
})
