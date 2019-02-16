import { GraphQLSchema } from 'graphql';
import { IResolvers, makeExecutableSchema } from 'graphql-tools';
import { processRequest } from 'graphql-upload';
import { IncomingMessage } from 'http';
import * as stream from 'stream';
import { runHttpQuery } from 'apollo-server-core';
import { Headers } from 'apollo-server-env';
import {
  Context as LambdaContext,
  APIGatewayProxyEvent
} from 'aws-lambda';

type Context = { [key: string]: any }

interface LambdaContextParameters {
  event: APIGatewayProxyEvent,
  context: LambdaContext
}

type LambdaContextCallback = (params: LambdaContextParameters) => Context

interface LambdaOptions {
  formatError?: Function,
  formatResponse?: Function,
  uploads?: UploadOptions
}

interface LambdaProps {
  typeDefs?: string,
  resolvers?: IResolvers,
  context?: Context | LambdaContextCallback,
  options?: LambdaOptions,
  schema?: GraphQLSchema
}

interface UploadOptions {
  maxFieldSize?: number
  maxFileSize?: number
  maxFiles?: number
}

const defaultOptions: LambdaOptions = {
  uploads: {}
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
  }

  graphqlHandler = async (
    event: APIGatewayProxyEvent,
    context: LambdaContext
  ) => {
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
            context: this.context
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
}
