import { resolvers } from "../src/graphql/resolvers";
import { expect, test } from "bun:test";
import { validateBookmarkTitle, validateBookmarkUrl } from "../src/validators/bookmark";
import { Prisma } from "../src/generated/prisma/client";
import type { GraphQLContext } from "../src/graphql/context";


test("rejects an empty bookmark title", () => {
  expect(() => validateBookmarkTitle("")).toThrow(
    "Bookmark title cannot be empty.",
  );
});

test("rejects a whitespace-only bookmark title", () => {
  expect(() => validateBookmarkTitle("   ")).toThrow(
    "Bookmark title cannot be empty.",
  );
});

test("rejects an invalid bookmark URL", () => {
  expect(() => validateBookmarkUrl("not-a-valid-url")).toThrow(
    "Bookmark URL is invalid.",
  );
});

test("accepts a valid bookmark URL", () => {
  expect(() => validateBookmarkUrl("https://example.com")).not.toThrow();
});


test("accepts a valid bookmark title", () => {
  expect(() => validateBookmarkTitle("Google")).not.toThrow();
});


test("folders resolver returns folders from Prisma", async () => {
  const folders = [
    {
      id: "folder-1",
      name: "Technology",
      createdAt: new Date("2026-08-26T10:00:00Z"),
    },
  ];

 const context = {
    prisma: {
      folder: {
        findMany: async () => folders,
      },
    },
  };
const result = await resolvers.Query.folders(
  {},
  {},
  context as unknown as GraphQLContext,
);

  expect(result).toEqual(folders);
});




test("folder resolver returns a folder with bookmarks", async () => {
  const folder = {
    id: "folder-1",
    name: "Technology",
    createdAt: new Date("2026-08-26T10:00:00Z"),
    bookmarks: [
      {
        id: "bookmark-1",
        title: "GraphQL",
        url: "https://graphql.org",
        tags: ["graphql"],
        folderId: "folder-1",
        createdAt: new Date("2026-08-26T11:00:00Z"),
      },
    ],
  };

  const context = {
    prisma: {
      folder: {
        findUnique: async () => folder,
      },
    },
  };

  const result = await resolvers.Query.folder(
    {},
    { id: "folder-1" },
    context as unknown as GraphQLContext,
  );

  expect(result).toEqual(folder);
});



test("folder resolver throws NOT_FOUND when folder does not exist", async () => {
  const context = {
    prisma: {
      folder: {
        findUnique: async () => null,
      },
    },
  };

  await expect(
    resolvers.Query.folder(
      {},
      { id: "missing-folder" },
      context as unknown as GraphQLContext,
    ),
  ).rejects.toMatchObject({
    message: "Folder not found.",
    extensions: {
      code: "NOT_FOUND",
    },
  });
});




test("updateBookmark rejects a whitespace-only title", async () => {
  const context = {
    prisma: {
      bookmark: {
        update: async () => {
          throw new Error("Prisma update should not be called");
        },
      },
    },
  };

  await expect(
    resolvers.Mutation.updateBookmark(
      {},
      {
        id: "bookmark-1",
        title: "   ",
        url: "https://example.com",
        tags: [],
      },
      context as unknown as GraphQLContext,
    ),
  ).rejects.toMatchObject({
    message: "Bookmark title cannot be empty.",
    extensions: {
      code: "BAD_USER_INPUT",
    },
  });
});



test("updateBookmark rejects an invalid URL", async () => {
  const context = {
    prisma: {
      bookmark: {
        update: async () => {
          throw new Error("Prisma update should not be called");
        },
      },
    },
  };

  await expect(
    resolvers.Mutation.updateBookmark(
      {},
      {
        id: "bookmark-1",
        title: "Valid title",
        url: "not-a-valid-url",
        tags: [],
      },
      context as unknown as GraphQLContext,
    ),
  ).rejects.toMatchObject({
    message: "Bookmark URL is invalid.",
    extensions: {
      code: "BAD_USER_INPUT",
    },
  });
});




test("updateBookmark throws NOT_FOUND when bookmark does not exist", async () => {
  const context = {
    prisma: {
      bookmark: {
        update: async () => {
          throw new Prisma.PrismaClientKnownRequestError(
            "Record not found",
            {
              code: "P2025",
              clientVersion: "7.10.0",
            },
          );
        },
      },
    },
  };

  await expect(
    resolvers.Mutation.updateBookmark(
      {},
      {
        id: "missing-bookmark",
        title: "Valid title",
        url: "https://example.com",
        tags: [],
      },
      context as unknown as GraphQLContext,
    ),
  ).rejects.toMatchObject({
    message: "Bookmark not found.",
    extensions: {
      code: "NOT_FOUND",
    },
  });
});



test("deleteBookmark throws NOT_FOUND when bookmark does not exist", async () => {
  const context = {
    prisma: {
      bookmark: {
        delete: async () => {
          throw new Prisma.PrismaClientKnownRequestError(
            "Record not found",
            {
              code: "P2025",
              clientVersion: "7.10.0",
            },
          );
        },
      },
    },
  };

  await expect(
    resolvers.Mutation.deleteBookmark(
      {},
      { id: "missing-bookmark" },
      context as unknown as GraphQLContext,
    ),
  ).rejects.toMatchObject({
    message: "Bookmark not found.",
    extensions: {
      code: "NOT_FOUND",
    },
  });
});



test("moveBookmark throws NOT_FOUND when folder does not exist", async () => {
  const context = {
    prisma: {
      bookmark: {
        update: async () => {
          throw new Prisma.PrismaClientKnownRequestError(
            "Foreign key constraint failed",
            {
              code: "P2003",
              clientVersion: "7.10.0",
            },
          );
        },
      },
    },
  };

  await expect(
    resolvers.Mutation.moveBookmark(
      {},
      {
        id: "bookmark-1",
        folderId: "missing-folder",
      },
      context as unknown as GraphQLContext,
    ),
  ).rejects.toMatchObject({
    message: "Folder not found.",
    extensions: {
      code: "NOT_FOUND",
    },
  });
});



test("moveBookmark throws NOT_FOUND when bookmark does not exist", async () => {
  const context = {
    prisma: {
      bookmark: {
        update: async () => {
          throw new Prisma.PrismaClientKnownRequestError(
            "Record not found",
            {
              code: "P2025",
              clientVersion: "7.10.0",
            },
          );
        },
      },
    },
  };

  await expect(
    resolvers.Mutation.moveBookmark(
      {},
      {
        id: "missing-bookmark",
        folderId: "folder-1",
      },
      context as unknown as GraphQLContext,
    ),
  ).rejects.toMatchObject({
    message: "Bookmark not found.",
    extensions: {
      code: "NOT_FOUND",
    },
  });
});