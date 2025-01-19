// src/content/queries.js
import { collections } from "./config";
import { generateCollectionQueries } from "../utils/collections";

// Import utility functions
import {
  mergeCollectionItemsIntoStaticQueries,
  buildMenuItemsFromCollection,
  handleCollectionLevelAddToQuery,
  handleSingleItemAddToQuery,
} from "../utils/queries/queryUtils.js";

// 1) Base Static Queries
const STATIC_QUERIES = [
  {
    name: "NavMenu",
    description: "Main navigation menu items",
    items: [
      { label: "Home", href: "/" },
      // Everything else will be added dynamically from config
    ],
  },
  {
    name: "FooterMenu",
    description: "Footer links for site",
    items: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
    ],
  },
];

/**
 * 2) Merge Collection and Item-level addToQuery configurations into STATIC_QUERIES
 */
mergeCollectionItemsIntoStaticQueries(
  collections,
  STATIC_QUERIES,
  buildMenuItemsFromCollection,
  handleCollectionLevelAddToQuery,
  handleSingleItemAddToQuery
);

// 3) Dynamic queries
const COLLECTION_QUERIES = generateCollectionQueries();

// 4) Combine & export
export const QUERIES = [
  ...STATIC_QUERIES,
  ...COLLECTION_QUERIES,
];

// Debug: Log the final queries
console.log(QUERIES);
