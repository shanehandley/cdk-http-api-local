import { ApiGatewayV2HttpApiParser as Parser } from '../../src/parser/apigwv2HttpApi'

describe('Parser', () => {
  it('validates the file at template path exists', async () => {
    const parser = new Parser('./blah.json')

    const parse = async () => parser.parse()

    await expect(parse()).rejects.toThrow('ENOENT')
  })

  it('parses a simple ApiGatewayv2 API from a template', async () => {
    const parser = new Parser('./test/fixtures/apigwv2/simple-api.json')

    const parse = async () => parser.parse()

    await expect(parse()).resolves.toEqual({
      routes: [
        {
          method: 'GET',
          path: '/test',
          fnPath: 'src/testFunction.ts',
        },
      ],
    })
  })
})
