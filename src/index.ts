import { GraphQLSchema } from 'graphql';
import {
  IResolvers,
  makeExecutableSchema
} from 'graphql-tools';
import { processRequest } from 'graphql-upload';
import * as stream from 'stream';
import { runHttpQuery } from 'apollo-server-core';
import { Headers } from 'apollo-server-env';
import lambdaPlayground from 'graphql-playground-middleware-lambda';
import { deflate } from 'graphql-deduplicator';
import {
  Context as LambdaContext,
  APIGatewayProxyEvent,
  APIGatewayProxyHandler
} from 'aws-lambda';
import {
  IMiddleware,
  applyMiddleware
} from 'graphql-middleware'

type Context = { [key: string]: any }

interface LambdaContextParameters {
  event: APIGatewayProxyEvent
  context: LambdaContext
}

type LambdaContextCallback = (params: LambdaContextParameters) => Context

interface LambdaOptions {
  uploads?: UploadOptions
  playgroundEndpoint?: string
  endpoint?: string
  deduplicator?: boolean
  formatError?: Function
  formatResponse?: Function
  debug?: boolean
}

interface LambdaProps {
  typeDefs?: string
  resolvers?: IResolvers
  context?: Context | LambdaContextCallback
  options?: LambdaOptions
  schema?: GraphQLSchema
  middlewares?: IMiddleware[]
}

interface UploadOptions {
  maxFieldSize?: number
  maxFileSize?: number
  maxFiles?: number
}

const defaultOptions: LambdaOptions = {
  uploads: {
    maxFieldSize: 1000000, // 1MB
    maxFileSize: 2000000, // 2MB
    maxFiles: 4
  },
  endpoint: '/graphql',
  deduplicator: true
}

export class GraphQLServerLambda {
  options: LambdaOptions
  executableSchema: GraphQLSchema

  protected context: any

  constructor(props: LambdaProps) {
    this.options = {
      ...defaultOptions,
      ...props.options
    },
    this.context = props.context
    if (props.schema) {
      this.executableSchema = props.schema
    } else if (props.typeDefs && props.resolvers) {
      let { typeDefs, resolvers } = props
      this.executableSchema = makeExecutableSchema({
        typeDefs,
        resolvers
      })
    }
    if (props.middlewares) {
      const { schema } = applyMiddleware(
        this.executableSchema,
        ...props.middlewares,
      )
      this.executableSchema = schema
    }
  }

  graphqlHandler = async (
    event: APIGatewayProxyEvent,
    context: LambdaContext
  ) => {
    let apolloContext
    try {
      apolloContext =
        typeof this.context === 'function'
          ? await this.context({ event, context })
          : this.context
    } catch (e) {
      console.error(e)
      throw e
    }

    const formatResponse = (event: APIGatewayProxyEvent) => {
      return (response, ...args) => {
        if (
          this.options.deduplicator &&
          event.headers &&
          event.headers['X-GraphQL-Deduplicate'] &&
          response.data &&
          !response.data.__schema
        ) {
          response.data = deflate(response.data)
        }
        return this.options.formatResponse
          ? this.options.formatResponse(response, ...args)
          : response
      }
    }

    const contentType = event.headers['content-type'] || event.headers['Content-Type']

    let query;
    if (event.body && contentType.startsWith('application/json')) {
      query = JSON.parse(event.body)
    } else if (event.body && contentType.startsWith('multipart/form-data')) {
      const request = new stream.Readable() as any;
      const response = new stream.Writable() as any;
      request.push(Buffer.from(event.body, event.isBase64Encoded ? 'base64' : 'ascii'),);
      request.push(null);
      request.headers = event.headers;
      request.headers['content-type'] = contentType;
      query = await processRequest(request, response, this.options.uploads)
    } else {
      query = event.queryStringParameters
    }

    try {
      const { graphqlResponse, responseInit } = await runHttpQuery(
        [event, context],
        {
          method: event.httpMethod,
          options: {
            schema: this.executableSchema,
            context: apolloContext,
            formatError: this.options.formatError,
            formatResponse: formatResponse(event),
            debug: this.options.debug
          },
          query: query,
          request: {
            url: event.path,
            method: event.httpMethod,
            headers: new Headers(event.headers)
          }
        }
      )
      return {
        body: graphqlResponse,
        statusCode: 200,
        headers: responseInit.headers
      }
    } catch (error) {
      if ('HttpQueryError' !== error.name) {
        return error
      }
      return {
        body: error.message,
        statusCode: error.statusCode,
        headers: error.headers
      }
    }
  }

  playgroundHandler: APIGatewayProxyHandler = (event, lambdaContext, callback) => {
    lambdaPlayground({
      endpoint: this.options.endpoint
    })(event, lambdaContext, callback)
  }
}
