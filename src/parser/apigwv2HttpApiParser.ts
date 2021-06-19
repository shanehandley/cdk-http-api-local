import { promises as fs } from 'fs'
import * as path from 'path'
import { ApiDefinition, CdkTemplate, ApiGatewayV2RouteProperties, CdkIntegrationDefinition, CdkLambdaFunctionDefinition, ApiRouteDefinition } from './types'
import { CdkTemplateParser } from './cdkTemplateParser'
import { Config } from '..'

export class ApiGatewayV2HttpApiParser extends CdkTemplateParser {
  private api: ApiDefinition

  constructor(config: Config) {
    super(config)
    this.api = {}
  }

  parse = async (): Promise<ApiDefinition> => {
    const location = path.join(process.cwd(), this.getTemplatePath())

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
        const { lambdaFileExtension } = this.getConfig()

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
}
