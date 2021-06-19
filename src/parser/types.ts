import type {
  ApiGatewayV2RouteProps,
  ApiGatewayV2IntegrationProps,
  LambdaFunctionProps,
} from '@fmtk/cfntypes'

export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE'
}

export interface CdkTemplate {
  Resources: {
    [key: string]: CdkRouteDefinition | CdkIntegrationDefinition
  }
}

export type LambdaFnEnvironment = { [key: string]: string }

export interface CdkFnGetAtt {
  'Fn::GetAtt': [string, 'Arn']
}

export interface CdkRouteDefinitionIntegrationTarget {
  'Fn::Join': [
    '',
    [
      'integrations/',
      {
        Ref: string
      }
    ]
  ]
}

export type CdkLambdaFunctionDefinition = {
  Type: 'Aws::Lambda::Function'
  Properties: LambdaFunctionProps,
}

export interface CdkNodejsFunctionDefinition extends CdkLambdaFunctionDefinition {
  Metadata: {
    'aws:cdk:path': string,
    'aws:asset:path': string,
    'aws:asset:property': string
  }
}

export type ApiGatewayV2IntegrationProperties = ApiGatewayV2IntegrationProps & {
  IntegrationUri: CdkFnGetAtt
}

export type CdkIntegrationDefinition = {
  Type: 'AWS::ApiGatewayV2::Integration'
  Properties: ApiGatewayV2IntegrationProperties
}

export type ApiGatewayV2RouteProperties = ApiGatewayV2RouteProps & {
  Target: CdkRouteDefinitionIntegrationTarget
}

export type CdkRouteDefinition = {
  Type: 'AWS::ApiGatewayV2::Route'
  Properties: ApiGatewayV2RouteProperties
}

export interface ApiRouteDefinition {
  method: HttpMethod
  path: string
  fnPath: string
  env: { [key: string]: string }
}

export interface ApiDefinition {
  routes?: ApiRouteDefinition[]
}
