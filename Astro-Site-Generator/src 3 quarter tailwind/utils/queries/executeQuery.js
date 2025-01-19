// src/utils/queries/executeQuery.js
import { QUERIES } from "../../content/queries.js";

/** findQueryDefinition: Look up a query by name in QUERIES */
function findQueryDefinition(name) {
  return QUERIES.find((q) => q.name === name) || null;
}

/**
 * executeQuery:
 * - queryName: The name of the query (string)
 * - params: Optional object to pass into `getItems()`
 */
export async function executeQuery(queryName, params = {}) {
  const queryDef = findQueryDefinition(queryName);
  if (!queryDef) {
    throw new Error(`Query "${queryName}" not found in queries.js`);
  }

  // If dynamic query: call `getItems(params)`
  if (typeof queryDef.getItems === "function") {
    return await queryDef.getItems(params);
  }

  // If static query: return the items array
  if (Array.isArray(queryDef.items)) {
    return queryDef.items;
  }

  // Otherwise, return empty or throw
  return [];
}
