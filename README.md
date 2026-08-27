# Bookmark Manager GraphQL API

A production-minded Bookmark Manager API built with Bun, TypeScript, GraphQL Yoga, PostgreSQL, Prisma, and Docker Compose.

The API allows users to organize bookmarks into folders, search bookmarks by title, move bookmarks between folders, and paginate bookmarks using cursor-based pagination.

## Tech Stack

- Bun
- TypeScript
- GraphQL
- GraphQL Yoga
- PostgreSQL 16
- Prisma 7
- Docker Compose

## Features

### Folders

- Create folders
- List all folders
- Fetch a single folder
- Fetch a folder with its nested bookmarks

### Bookmarks

- Create bookmarks
- Update bookmarks
- Delete bookmarks
- Move bookmarks between folders
- Filter bookmarks by folder
- Search bookmarks by title
- Cursor-based pagination

### Validation and Error Handling

The API validates:

- Empty bookmark titles
- Whitespace-only bookmark titles
- Invalid bookmark URLs

The API also returns meaningful GraphQL errors for:

- Bookmark not found
- Folder not found
- Moving a bookmark to a nonexistent folder

## Project Structure

```text
bookmark-manager/
├── prisma/
│   ├── migrations/
│   └── schema.prisma
│
├── src/
│   ├── generated/
│   │   └── prisma/
│   ├── graphql/
│   │   ├── check-schema.ts
│   │   ├── context.ts
│   │   ├── resolvers.ts
│   │   ├── schema.graphql
│   │   └── schema.ts
│   ├── lib/
│   │   └── prisma.ts
│   ├── validators/
│   │   ├── bookmark.ts
│   │   └── folder.ts
│   ├── server.ts
│   └── test-db.ts
│
├── tests/
│   ├── bookmark.test.ts
│   ├── folder.test.ts
│   ├── integration.test.ts
│   └── test-context.ts
│
├── .env.example
├── docker-compose.yml
├── package.json
├── prisma.config.ts
├── tsconfig.json
└── README.md
Prerequisites

Install the following:

Bun
Docker Desktop

Verify Bun:

bun --version

Verify Docker:

docker --version
Environment Variables

Create a .env file in the project root.

DATABASE_URL=postgresql://bookmark_user:bookmark_local_2026@localhost:5432/bookmark_manager

A template is provided in .env.example.

Do not commit .env to Git.

Start PostgreSQL

Start the PostgreSQL container with Docker Compose:

docker compose up -d

Check that the container is running:

docker compose ps

PostgreSQL will be available on:

localhost:5432
Install Dependencies
bun install
Prisma

Generate the Prisma client:

bunx prisma generate

Create and apply migrations during development:

bunx prisma migrate dev

The migrations are stored in:

prisma/migrations/

To inspect the database:

bunx prisma studio
Run the API

Start the GraphQL API:

bun run src/server.ts

The server runs on:

http://localhost:3000

GraphQL endpoint:

http://localhost:3000/graphql

GraphiQL is available through the GraphQL endpoint in the browser.

GraphQL Queries
List Folders
query {
  folders {
    id
    name
    createdAt
  }
}
Fetch a Folder With Bookmarks
query {
  folder(id: "FOLDER_ID") {
    id
    name
    createdAt
    bookmarks {
      id
      title
      url
      tags
      folderId
      createdAt
    }
  }
}
List Bookmarks
query {
  bookmarks {
    id
    title
    url
    tags
    folderId
    createdAt
  }
}
Filter by Folder
query {
  bookmarks(folderId: "FOLDER_ID") {
    id
    title
    url
    tags
    folderId
  }
}
Search by Title

Search uses a case-insensitive substring match against the bookmark title.

query {
  bookmarks(search: "google") {
    id
    title
    url
    tags
  }
}
Cursor-Based Pagination

The bookmarks query supports:

take
cursor

First request:

query {
  bookmarks(take: 2) {
    id
    title
    url
  }
}

Use the id of the last returned bookmark as the cursor for the next request:

query {
  bookmarks(
    take: 2
    cursor: "LAST_BOOKMARK_ID"
  ) {
    id
    title
    url
  }
}

The resolver uses the cursor bookmark as the starting point and skips that record so that it is not returned again.

GraphQL Mutations
Create Folder
mutation {
  createFolder(name: "Development") {
    id
    name
    createdAt
  }
}
Create Bookmark
mutation {
  createBookmark(
    title: "Google"
    url: "https://www.google.com"
    tags: ["search", "web"]
    folderId: "FOLDER_ID"
  ) {
    id
    title
    url
    tags
    folderId
    createdAt
  }
}
Update Bookmark
mutation {
  updateBookmark(
    id: "BOOKMARK_ID"
    title: "Google Updated"
    url: "https://www.google.com"
    tags: ["search", "updated"]
  ) {
    id
    title
    url
    tags
    folderId
  }
}
Delete Bookmark
mutation {
  deleteBookmark(id: "BOOKMARK_ID") {
    id
    title
    url
    folderId
  }
}
Move Bookmark
mutation {
  moveBookmark(
    id: "BOOKMARK_ID"
    folderId: "TARGET_FOLDER_ID"
  ) {
    id
    title
    url
    tags
    folderId
  }
}
Testing

Run all tests:

bun test

Run bookmark resolver tests:

bun test tests/bookmark.test.ts

Run folder resolver tests:

bun test tests/folder.test.ts

Run the PostgreSQL integration test:

bun test tests/integration.test.ts

Run TypeScript type checking:

bunx tsc --noEmit

The integration test requires PostgreSQL to be running through Docker Compose.

Test Coverage

The test suite includes:

Bookmark title validation
Whitespace-only title validation
URL validation
Valid bookmark input
Folder queries
Nested folder bookmarks
Folder not found handling
Bookmark update validation
Bookmark update not found handling
Bookmark deletion not found handling
Bookmark move error handling
Folder creation
PostgreSQL integration testing
Error Handling

Validation failures return GraphQL errors with the BAD_USER_INPUT code.

Example:

{
  "errors": [
    {
      "message": "Bookmark title cannot be empty.",
      "extensions": {
        "code": "BAD_USER_INPUT"
      }
    }
  ]
}

Missing resources use the NOT_FOUND error code.

Design Decisions
Schema-First GraphQL

The GraphQL schema is defined in:

src/graphql/schema.graphql

Resolvers are kept separately in:

src/graphql/resolvers.ts

This keeps the API contract separate from the resolver implementation.

Cursor Pagination

Pagination is implemented using the bookmark id as the cursor.

The query accepts:

take
cursor

The first request retrieves the first page. The client then supplies the last bookmark ID as the cursor for the next request.

Prisma's cursor and skip options are used to continue from the correct position without returning the cursor record again.

Database Relationships

Each bookmark belongs to exactly one folder.

The Prisma relation is:

Folder 1 ─────── * Bookmark

Bookmarks also have an index on folderId to support folder-based queries efficiently.

How I'd Extend This

If this API needed to grow further, I would consider:

Search improvements
Observability and structured logging
API versioning
Database/query performance improvements
Scaling the API horizontally

These are intentionally outside the current assignment scope.

Git Workflow

The project is developed using incremental commits with meaningful commit messages.

Examples:

feat: add Prisma schema and database migrations
feat: add GraphQL folder queries
feat: add bookmark mutations
test: add bookmark resolver tests
test: add PostgreSQL integration test
docs: add local setup instructions
License

This project was created as a technical assignment