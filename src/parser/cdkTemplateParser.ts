import { Config } from '..'
import type { ApiDefinition, CdkTemplate } from './types'

export class CdkTemplateParser {
  private config: Config

  constructor(config: Config) {
    this.config = config
  }

  parse = (): Promise<ApiDefinition> => {
    return Promise.resolve({} as ApiDefinition)
  }

  getTemplatePath = (): string => this.config.templatePath

  getConfig = (): Config => this.config

  getResourceByTitle = <T>(
    template: CdkTemplate,
    resourceTitle: string
  ): T => (template.Resources[resourceTitle] as unknown) as T
}
