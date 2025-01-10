// src/utils/collections.js
import { collections } from "../content/config"; // Adjusted import path

/**
 * Returns an array of available collections dynamically.
 * @returns {Array<string>} - List of collection names.
 */
export const getAvailableCollections = () => {
  return Object.keys(collections);
};

/**
 * Validates if a given collection exists.
 * @param {string} collection - The name of the collection to validate.
 * @returns {boolean} - Returns true if the collection exists, false otherwise.
 */
export const isValidCollection = (collection) => {
  const availableCollections = getAvailableCollections();
  return availableCollections.includes(collection);
};

/**
 * Formats the collection name for display (e.g., capitalizes the first letter).
 * @param {string} collection - The name of the collection.
 * @returns {string} - The formatted collection name.
 */
export const formatCollectionName = (collection) => {
  if (!collection) return "";
  return collection.charAt(0).toUpperCase() + collection.slice(1);
};

/**
 * Fetches all items from a specified collection.
 * @param {string} collection - The name of the collection.
 * @returns {Array<Object>} - An array of collection items.
 * @throws {Error} - If the collection is not valid.
 */
export const fetchCollectionItems = async (collection) => {
  if (!isValidCollection(collection)) {
    throw new Error(`Collection "${collection}" is not valid.`);
  }
  return collections[collection].data;
};

/**
 * Fetches a single item by slug from a specified collection.
 * @param {string} collection - The name of the collection.
 * @param {string} slug - The slug of the item.
 * @returns {Object|null} - The collection item or null if not found.
 * @throws {Error} - If the collection is not valid.
 */
export const fetchCollectionItem = async (collection, slug) => {
  if (!isValidCollection(collection)) {
    throw new Error(`Collection "${collection}" is not valid.`);
  }

  const collectionItems = collections[collection]?.data || [];
  const item = collectionItems.find((item) => item.slug === slug);

  if (!item) {
    console.error(
      `Item with slug "${slug}" not found in collection "${collection}"`
    );
  }

  return item || null;
};

/**
 * Generates static paths for all collections that have hasPage set to true.
 * @returns {Array<Object>} - An array of path objects.
 */
export const generateCollectionPaths = async () => {
  const availableCollections = getAvailableCollections();
  const paths = [];

  availableCollections.forEach((col) => {
    const collection = collections[col];
    if (collection.metadata.hasPage) {
      paths.push({
        params: { collection: col },
      });
    }
  });

  return paths;
};

/**
 * Generates static paths for all items in all collections, respecting hasPage and itemsHasPage.
 * @returns {Array<Object>} - An array of path objects.
 */
export const generateItemPaths = async () => {
  const paths = [];

  for (const [collectionName, collection] of Object.entries(collections)) {
    const { itemsHasPage } = collection.metadata;

    collection.data.forEach((item) => {
      const itemHasPage = item.hasPage !== undefined ? item.hasPage : null;

      if (itemsHasPage) {
        // Collection allows item pages
        if (itemHasPage !== false) {
          // Include item if hasPage is true or not set
          paths.push({
            params: {
              collection: collectionName,
              slug: item.slug,
            },
          });
        }
      } else {
        // Collection does not allow item pages
        if (itemHasPage === true) {
          // Include item only if hasPage is explicitly true
          paths.push({
            params: {
              collection: collectionName,
              slug: item.slug,
            },
          });
        }
      }
    });
  }

  return paths;
};

/**
 * Retrieves and validates a collection item, throwing a user-friendly error if not found.
 * @param {string} collection - The name of the collection.
 * @param {string} slug - The slug of the item.
 * @returns {Object} - The collection item.
 * @throws {Error} - If the collection or item is invalid/not found.
 */
export const getValidatedCollectionItem = async (collection, slug) => {
  if (!isValidCollection(collection)) {
    throw new Error(`Collection "${collection}" not found.`);
  }

  const item = await fetchCollectionItem(collection, slug);

  if (!item) {
    throw new Error(
      `Item with slug "${slug}" not found in collection "${collection}".`
    );
  }

  return item;
};

/**
 * Fetches and formats all necessary data for a collection page.
 * @param {string} collection - The name of the collection.
 * @returns {Object} - An object containing items, pageTitle, and pageDescription.
 * @throws {Error} - If the collection is not valid.
 */
export const getCollectionPageData = async (collection) => {
  const items = await fetchCollectionItems(collection);
  const formattedCollectionName = formatCollectionName(collection);
  const pageTitle = `Our ${formattedCollectionName}`;
  const pageDescription = `Explore our ${formattedCollectionName} and discover what we offer.`;

  return { items, pageTitle, pageDescription };
};

/**
 * Fetches and formats data for a collection item page.
 * @param {string} collection - The name of the collection.
 * @param {string} slug - The slug of the item.
 * @returns {Object} - An object containing title, description, icon, featuredImage, and pageTitle.
 * @throws {Error} - If the collection or item is invalid/not found.
 */
export const getCollectionItemPageData = async (collection, slug) => {
  const item = await getValidatedCollectionItem(collection, slug);
  const pageTitle = `${item.title} | ${formatCollectionName(collection)}`;

  return { ...item, pageTitle };
};

/**
 * Fetches all featured items from a specified collection.
 * @param {string} collection - The name of the collection.
 * @returns {Array<Object>} - An array of featured collection items.
 * @throws {Error} - If the collection is not valid.
 */
export const fetchFeaturedItems = async (collection) => {
  const items = await fetchCollectionItems(collection);
  return items.filter(item => item.featured === true);
};
