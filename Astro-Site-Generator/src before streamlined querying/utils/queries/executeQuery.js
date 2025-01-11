// src/utils/queries/executeQuery.js
import { QUERIES } from "../../content/queries.js";

/**
 * findQueryDefinition
 * Looks up a query by name in QUERIES
 */
function findQueryDefinition(name) {
  return QUERIES.find((q) => q.name === name) || null;
}

/**
 * executeQuery
 * Finds the named query, returns the items array
 */
export function executeQuery(queryName) {
  const queryDef = findQueryDefinition(queryName);
  if (!queryDef) {
    throw new Error(`Query "${queryName}" not found in queries.js`);
  }
  // For now, it's purely static—just return the items.
  return queryDef.items;
}
