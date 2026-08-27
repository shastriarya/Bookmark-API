import { expect, test } from "bun:test";
import { resolvers } from "../src/graphql/resolvers";
import type { GraphQLContext } from "../src/graphql/context";

test("createFolder resolver creates and returns a folder", async () => {
  const folder = {
    id: "folder-1",
    name: "Technology",
    createdAt: new Date("2026-08-27T10:00:00Z"),
  };

  const context = {
    prisma: {
      folder: {
        create: async () => folder,
      },
    },
  };

  const result = await resolvers.Mutation.createFolder(
    {},
    { name: "Technology" },
   context as unknown as GraphQLContext,
  );

  expect(result).toEqual(folder);
});