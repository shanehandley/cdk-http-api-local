# cdk-http-api-local

(Experimental) development tool for developing/testing AWS Api Gateway v2 / Lambda API's built with CDK.

## Rationale

I couldn't find a decent hot-reloading and snappy local development experience while developing HTTP API's backed by API Gateway / Lambda integrations via CDK.

There are tools like `serverless-local`, but hot reloading is flaky and they require another definition file to run things locally while testing (`serverless.yml`).

This reads the CDK template output and builds the API from Route and Integration definitions, removing the need to duplicate declarations for a local development environment.

Heavy lifting is done via `lambda-local`

## Assumptions

- CDK is outputting an AWS::APIGatewayv2 resource (not v1)
- Functions are defined using the [@aws-cdk/aws-lambda-nodejs module](https://docs.aws.amazon.com/cdk/api/latest/docs/aws-lambda-nodejs-readme.html)

## Usage

`local.ts`

```ts
import { apigwv2HttpApi } from 'cdk-http-api-local'

apigwv2HttpApi({
  templatePath: './infrastructure/cdk.out/api.template.json',
  port: 1234
})
```

Run 

```
$ ts-node local.ts
````

Then test your api via `http://localhost:1234`

# LICENSE

MIT