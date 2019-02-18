import { GraphQLServerLambda } from 'graphql-kungfu';
import typeDefs from './types';
import resolvers from './resolvers';

const lambda = new GraphQLServerLambda({
  typeDefs,
  resolvers,
  options: {
    endpoint: '/graphql'
  }
});

export const server = lambda.graphqlHandler;
export const playground = lambda.playgroundHandler;