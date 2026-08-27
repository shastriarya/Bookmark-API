import { createSchema, createYoga } from "graphql-yoga";
import { readFileSync } from "node:fs";
import { prisma, type GraphQLContext } from "./graphql/context";
import { resolvers } from "./graphql/resolvers";

const typeDefs = readFileSync(
  new URL("./graphql/schema.graphql", import.meta.url),
  "utf-8",
);

const yoga = createYoga<GraphQLContext>({
  schema: createSchema({
    typeDefs,
    resolvers,
  }),
  context: {
    prisma,
  },
});

const server = Bun.serve({
  port: 3000,
  fetch: (request) => yoga.fetch(request),
});

console.log(`Server running at ${server.url}`);