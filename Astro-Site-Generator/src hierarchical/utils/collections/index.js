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
