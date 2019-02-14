import { GraphQLSchema } from 'graphql';
import { IResolvers, makeExecutableSchema } from 'graphql-tools';
import { processRequest } from 'graphql-upload';
import { IncomingMessage } from 'http';
import * as stream from 'stream';
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
  ): Promise<void> => {
    const contentType = event.headers['content-type'] || event.headers['Content-Type']

    let query = event.body
    if (query && contentType.startsWith('application/json')) {
      query = JSON.parse(query)
    }
  }
}
