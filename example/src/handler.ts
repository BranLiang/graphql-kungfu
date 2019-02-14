import { GraphQLServerLambda } from '../../src';
import typeDefs from './types';
import resolvers from './resolvers';

const lambda = new GraphQLServerLambda({
  typeDefs,
  resolvers
});

export const server = lambda.graphqlHandler