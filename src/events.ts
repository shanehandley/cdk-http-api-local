import type { APIGatewayProxyEventV2 } from 'aws-lambda'

export const asHttpEvent = (body: { [key: string]: any }, headers = {}) => ({
  headers,
  body
} as unknown as APIGatewayProxyEventV2)

export const asQueryString = (queryStringParameters: { [key: string]: any }, headers = {}) => ({
  headers,
  queryStringParameters
} as unknown as APIGatewayProxyEventV2)

export const emptyEvent = asHttpEvent({})

export type LambdaResult = {
  statusCode: number,
  body: string,
  headers?: {
    [key: string]: string
  }
}
