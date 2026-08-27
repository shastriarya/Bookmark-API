import type { GraphQLContext } from "./context";
import { validateBookmarkTitle, validateBookmarkUrl } from "../validators/bookmark";
import { GraphQLError } from "graphql";
import { Prisma } from "../generated/prisma/client";

export const resolvers = {
  Query: {
    folders: async (
      _parent: unknown,
      _args: Record<string, never>,
      context: GraphQLContext,
    ) => {
      return context.prisma.folder.findMany({
        orderBy: {
          createdAt: "asc",
        },
      });
    },

   folder: async (
  _parent: unknown,
  args: { id: string },
  context: GraphQLContext,
) => {
  const folder = await context.prisma.folder.findUnique({
    where: {
      id: args.id,
    },
    include: {
      bookmarks: true,
    },
  });

  if (!folder) {
    throw new GraphQLError("Folder not found.", {
      extensions: {
        code: "NOT_FOUND",
      },
    });
  }

  return folder;
},

    bookmarks: async (
      _parent: unknown,
      args: {
        folderId?: string;
        search?: string;
        take?: number;
        cursor?: string;
      },
      context: GraphQLContext,
    ) => {
      return context.prisma.bookmark.findMany({
        where: {
          ...(args.folderId
            ? {
                folderId: args.folderId,
              }
            : {}),
          ...(args.search
            ? {
                title: {
                  contains: args.search,
                  mode: "insensitive",
                },
              }
            : {}),
        },
        orderBy: {
          createdAt: "asc",
        },
        ...(args.take !== undefined
          ? {
              take: args.take,
            }
          : {}),
        ...(args.cursor
          ? {
              cursor: {
                id: args.cursor,
              },
              skip: 1,
            }
          : {}),
      });
    },
  }, 

  Mutation: {
    createFolder: async (
      _parent: unknown,
      args: { name: string },
      context: GraphQLContext,
    ) => {
      return context.prisma.folder.create({
        data: {
          name: args.name,
        },
      });
    },

    createBookmark: async (
      _parent: unknown,
      args: {
        title: string;
        url: string;
        tags: string[];
        folderId: string;
      },
      context: GraphQLContext,
    ) => {
      // 1. Validate Title
      try {
        validateBookmarkTitle(args.title);
      } catch (error: unknown) {
        if (error instanceof Error) {
          throw new GraphQLError(error.message, {
            extensions: {
              code: "BAD_USER_INPUT",
            },
          });
        }
        throw new GraphQLError("Invalid bookmark title.", {
          extensions: {
            code: "BAD_USER_INPUT",
          },
        });
      }

      // 2. Validate URL (Added to catch invalid URLs)
      try {
        validateBookmarkUrl(args.url);
      } catch (error: unknown) {
        if (error instanceof Error) {
          throw new GraphQLError(error.message, {
            extensions: {
              code: "BAD_USER_INPUT",
            },
          });
        }
        throw new GraphQLError("Bookmark URL is invalid.", {
          extensions: {
            code: "BAD_USER_INPUT",
          },
        });
      }

      // 3. Create Bookmark only if validations pass
      return context.prisma.bookmark.create({
        data: {
          title: args.title,
          url: args.url,
          tags: args.tags,
          folderId: args.folderId,
        },
      });
    },

   updateBookmark: async (
  _parent: unknown,
  args: {
    id: string;
    title: string;
    url: string;
    tags: string[];
  },
  context: GraphQLContext,
) => {
  try {
    validateBookmarkTitle(args.title);
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new GraphQLError(error.message, {
        extensions: {
          code: "BAD_USER_INPUT",
        },
      });
    }

    throw new GraphQLError("Invalid bookmark title.", {
      extensions: {
        code: "BAD_USER_INPUT",
      },
    });
  }

  try {
  validateBookmarkUrl(args.url);
} catch (error: unknown) {
  if (error instanceof Error) {
    throw new GraphQLError(error.message, {
      extensions: {
        code: "BAD_USER_INPUT",
      },
    });
  }

  throw new GraphQLError("Bookmark URL is invalid.", {
    extensions: {
      code: "BAD_USER_INPUT",
    },
  });
}

  try {
  return await context.prisma.bookmark.update({
    where: {
      id: args.id,
    },
    data: {
      title: args.title,
      url: args.url,
      tags: args.tags,
    },
  });
} catch (error: unknown) {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2025"
  ) {
    throw new GraphQLError("Bookmark not found.", {
      extensions: {
        code: "NOT_FOUND",
      },
    });
  }

  throw error;
}
},

    deleteBookmark: async (
  _parent: unknown,
  args: { id: string },
  context: GraphQLContext,
) => {
  try {
    return await context.prisma.bookmark.delete({
      where: {
        id: args.id,
      },
    });
  } catch (error: unknown) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      throw new GraphQLError("Bookmark not found.", {
        extensions: {
          code: "NOT_FOUND",
        },
      });
    }

    throw error;
  }
},

    moveBookmark: async (
  _parent: unknown,
  args: {
    id: string;
    folderId: string;
  },
  context: GraphQLContext,
) => {
  try {
    return await context.prisma.bookmark.update({
      where: {
        id: args.id,
      },
      data: {
        folderId: args.folderId,
      },
    });
  } catch (error: unknown) {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError
  ) {
    if (error.code === "P2025") {
      throw new GraphQLError("Bookmark not found.", {
        extensions: {
          code: "NOT_FOUND",
        },
      });
    }

    if (error.code === "P2003") {
      throw new GraphQLError("Folder not found.", {
        extensions: {
          code: "NOT_FOUND",
        },
      });
    }
  }

  throw error;
}
},
  },
};