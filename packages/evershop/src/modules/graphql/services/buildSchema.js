import { makeExecutableSchema } from '@graphql-tools/schema';
import { buildResolvers } from './buildResolvers.js';
import { buildTypeDefs } from './buildTypes.js';

const resolvers = await buildResolvers(true);
const typeDefs = buildTypeDefs(true);

const schema = makeExecutableSchema({
  typeDefs,
  resolvers
});

export default schema;

