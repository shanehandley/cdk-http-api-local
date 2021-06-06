import { APIGatewayProxyEventV2 } from 'aws-lambda'

export const asHttpEventBody = (body: { [key: string]: any }, headers = {}) =>
  (({
    headers,
    body,
  } as unknown) as APIGatewayProxyEventV2)

export const asQueryString = (
  queryStringParameters: { [key: string]: any },
  headers = {}
) =>
  (({
    headers,
    queryStringParameters,
  } as unknown) as APIGatewayProxyEventV2)

export type LambdaResult = {
  statusCode: number
  body: string
  headers?: {
    [key: string]: string
  }
}
