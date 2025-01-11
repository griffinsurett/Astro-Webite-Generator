// src/utils/queries/executeQuery.js
import { QUERIES } from "../../content/queries.js";

/** findQueryDefinition: Look up a query by name in QUERIES */
function findQueryDefinition(name) {
  return QUERIES.find((q) => q.name === name) || null;
}

/** executeQuery: returns items from named query (static or dynamic) */
export async function executeQuery(queryName) {
  const queryDef = findQueryDefinition(queryName);
  if (!queryDef) {
    throw new Error(`Query "${queryName}" not found in queries.js`);
  }

  // If dynamic: "getItems()"
  if (typeof queryDef.getItems === "function") {
    return await queryDef.getItems();
  }

  // If static: "items" array
  if (Array.isArray(queryDef.items)) {
    return queryDef.items;
  }

  // Otherwise, return empty or throw
  return [];
}
