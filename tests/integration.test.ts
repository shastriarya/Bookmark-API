import { expect, test } from "bun:test";
import { prisma } from "../src/lib/prisma";

test("creates a folder in the real PostgreSQL database", async () => {
  const folder = await prisma.folder.create({
    data: {
      name: "Integration Test Folder",
    },
  });

  expect(folder.name).toBe("Integration Test Folder");

  await prisma.folder.delete({
    where: {
      id: folder.id,
    },
  });
});