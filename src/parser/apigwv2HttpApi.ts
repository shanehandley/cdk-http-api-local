import { promises as fs } from 'fs'
import { HttpMethod } from '../'
import * as path from 'path'
import {
  ApiGatewayV2RouteProps,
  ApiGatewayV2IntegrationProps,
  LambdaFunctionProps,
} from '@fmtk/cfntypes'

interface CdkFnGetAtt {
  'Fn::GetAtt': [string, 'Arn']
}

interface CdkRouteDefinitionIntegrationTarget {
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

type CdkLambdaFunctionDefinition = {
  Type: 'Aws::Lambda::Function'
  Properties: LambdaFunctionProps
}

type ApiGatewayV2IntegrationProperties = ApiGatewayV2IntegrationProps & {
  IntegrationUri: CdkFnGetAtt
}

type CdkIntegrationDefinition = {
  Type: 'AWS::ApiGatewayV2::Integration'
  Properties: ApiGatewayV2IntegrationProperties
}

type ApiGatewayV2RouteProperties = ApiGatewayV2RouteProps & {
  Target: CdkRouteDefinitionIntegrationTarget
}

type CdkRouteDefinition = {
  Type: 'AWS::ApiGatewayV2::Route'
  Properties: ApiGatewayV2RouteProperties
}

interface CdkTemplate {
  Resources: {
    [key: string]: CdkRouteDefinition | CdkIntegrationDefinition
  }
}

export interface ApiRouteDefinition {
  method: HttpMethod
  path: string
  fnPath: string
  env?: { [key: string]: string }
}

export interface ApiDefinition {
  routes?: ApiRouteDefinition[]
}

export class ApiGatewayV2HttpApiParser {
  private templatePath: string
  private api: ApiDefinition

  constructor(templatePath: string) {
    this.templatePath = templatePath
    this.api = {}
  }

  public parse = async (lambdaFileExtension = 'ts'): Promise<ApiDefinition> => {
    const location = path.join(process.cwd(), this.templatePath)

    await fs.stat(location)

    const file = await fs.readFile(location)
    const template = JSON.parse(file.toString()) as CdkTemplate

    const routes = Object.keys(template.Resources)
      .filter(
        (resourceTitle: string) =>
          template.Resources[resourceTitle].Type === 'AWS::ApiGatewayV2::Route'
      )
      .map(
        resource =>
          template.Resources[resource].Properties as ApiGatewayV2RouteProperties
      )
      .map(route => {
        const integrationProps = this.getResourceByTitle<
          CdkIntegrationDefinition
        >(template, route.Target['Fn::Join'][1][1].Ref)
        const lambdaProps = this.getResourceByTitle<
          CdkLambdaFunctionDefinition
        >(template, integrationProps.Properties.IntegrationUri['Fn::GetAtt'][0])

        const [method, path] = route.RouteKey.split(' ')

        return {
          method,
          path,
          fnPath: lambdaProps.Properties.Handler?.replace(
            '.default',
            `.${lambdaFileExtension}`
          ),
          env: lambdaProps.Properties.Environment,
        } as ApiRouteDefinition
      })

    this.api.routes = routes

    return this.api
  }

  private getResourceByTitle = <T>(
    template: CdkTemplate,
    resourceTitle: string
  ): T => (template.Resources[resourceTitle] as unknown) as T
}
