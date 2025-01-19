// src/utils/collections/index.js

// 1. Helpers
export { getAvailableCollections, isValidCollection, formatCollectionName } from "./collectionHelpers.js";

// 2. Fetchers
export {
  fetchCollectionItems,
  fetchCollectionItem,
  getValidatedCollectionItem,
  fetchFeaturedItems,
} from "./collectionFetchers.js";

// 3. Paths
export { generateCollectionPaths, generateItemPaths } from "./collectionPaths.js";

// 4. Page Data
export { getCollectionPageData, getCollectionItemPageData } from "./collectionPageData.js";

// 5. Queries.js
export { generateCollectionQueries } from "./CollectionQueries.js";

// 6. Hierarchical Helpers
export { findChildren, findParents, findSiblings } from "./HierarchicalHelpers.js";

// 7. Relational Helpers
export {
  getDirectAndReverseRefs,
  extractReferencesToOtherCollections,
  hasAnyReferenceIntersection,
  findMultiHopReferences,
  findSameCollectionReferences,
} from "./RelationalHelpers.js";
