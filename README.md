<p align="center"><img src="https://raw.githubusercontent.com/BranLiang/graphql-kungfu/master/cover.jpg" width="100" /></p>

# graphql-kungfu

[![npm version](https://badge.fury.io/js/graphql-kungfu.svg)](https://badge.fury.io/js/graphql-kungfu)

Easy setup powerful GraphQL Server on AWS Lambda.

## Overview

* **Serverless GraphQL server on AWS Lambda:** Focus on aws lambda only.
* **First package which support file upload:** Only solution officially available.

## Features

* GraphQL spec-compliant
* File upload
* GraphQL Subscriptions(not supported yet)
* TypeScript typings
* GraphQL Playground
* Schema directives
* Full example for reference
* Supports middleware out of the box.

## Install

```sh
yarn add graphql-kungfu
```

## Usage

### Quickstart

```ts
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
```

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details


