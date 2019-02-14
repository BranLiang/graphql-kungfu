import * as path from 'path'
import { fileLoader, mergeResolvers } from 'merge-graphql-schemas'

const resolvers = fileLoader(path.join(__dirname, './**/*.resolvers.*'))
const resolversMerged = mergeResolvers(resolvers)

export default resolversMerged