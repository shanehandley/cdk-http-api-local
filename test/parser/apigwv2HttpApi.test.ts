import { ApiGatewayV2HttpApiParser as Parser } from '../../src/parser/apigwv2HttpApiParser'

describe('Parser', () => {
  it('validates the file at template path exists', async () => {
    const parser = new Parser({
      templatePath: '/blah.json',
    })

    const parse = async () => parser.parse()

    await expect(parse()).rejects.toThrow('ENOENT')
  })

  it('parses a simple ApiGatewayv2 API from a template', async () => {
    const parser = new Parser({
      templatePath: './test/fixtures/apigwv2/simple-api.json',
    })

    const parse = async () => parser.parse()

    await expect(parse()).resolves.toEqual({
      routes: [
        {
          method: 'GET',
          path: '/test',
          fnPath: expect.stringContaining(
            '/asset.9dd88241a9acde7fb57ed54d31956af7fedc7228b364a7e935ecf43224b747ed/index.js'
          ),
        },
      ],
    })
  })
})
