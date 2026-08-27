import { readFileSync } from "node:fs";
import { buildSchema } from "graphql";

const schemaSource = readFileSync(
  new URL("./schema.graphql", import.meta.url),
  "utf-8",
);

const schema = buildSchema(schemaSource);

console.log("GraphQL schema is valid.");
console.log(`Types loaded: ${Object.keys(schema.getTypeMap()).length}`);