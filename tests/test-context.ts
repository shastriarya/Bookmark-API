import type { GraphQLContext } from "../src/graphql/context";
export type MockPrisma = {
  folder: {
    findMany?: () => Promise<unknown>;
    findUnique?: () => Promise<unknown>;
    create?: () => Promise<unknown>;
  };
  bookmark: {
    update?: () => Promise<unknown>;
    delete?: () => Promise<unknown>;
  };
};




export type MockGraphQLContext = {
  prisma: {
    folder: {
      findMany: GraphQLContext["prisma"]["folder"]["findMany"];
      findUnique: GraphQLContext["prisma"]["folder"]["findUnique"];
      create: GraphQLContext["prisma"]["folder"]["create"];
    };
    bookmark: {
      update: GraphQLContext["prisma"]["bookmark"]["update"];
      delete: GraphQLContext["prisma"]["bookmark"]["delete"];
    };
  };
};