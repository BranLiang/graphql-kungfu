<p align="center"><img src="https://raw.githubusercontent.com/BranLiang/graphql-kungfu/master/cover.jpg" width="600" /></p>

# graphql-kungfu

[![npm version](https://badge.fury.io/js/graphql-kungfu.svg)](https://badge.fury.io/js/graphql-kungfu)

Easy setup powerful GraphQL Server on AWS Lambda.

## Overview

* **Serverless GraphQL server on AWS Lambda**
* **First package which support file upload**

## Features

* GraphQL spec-compliant
* File upload
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

This project is licensed under the MIT License.


