// src/utils/redirects/handleRedirects.js
import { collections } from "../../content/config";
import { getAvailableCollections } from "../collections";

/**
 * If slug is a collection-level alias, return the real collection name or null
 */
function findCollectionRedirectAlias(collectionSlug) {
  for (const colName of getAvailableCollections()) {
    const colObj = collections[colName];
    if (
      colObj.metadata.redirectFrom &&
      colObj.metadata.redirectFrom.includes(collectionSlug)
    ) {
      return colName; 
    }
  }
  return null;
}

/**
 * If slug is an item-level alias, either in the given collection or across all
 */
function findItemRedirect(collection, slug) {
  if (collection && collections[collection]) {
    // Check only that collection
    const items = collections[collection].data;
    for (const it of items) {
      if (it.redirectFrom && it.redirectFrom.includes(slug)) {
        return { collection, targetSlug: it.slug };
      }
    }
  } else {
    // Check across all
    for (const colName of getAvailableCollections()) {
      const items = collections[colName].data;
      for (const it of items) {
        if (it.redirectFrom && it.redirectFrom.includes(slug)) {
          return { collection: colName, targetSlug: it.slug };
        }
      }
    }
  }
  return null;
}

/**
 * If slug is a direct collection-level redirect. E.g. "service" => "services"
 */
function findCollectionRedirect(slug) {
  for (const colName of getAvailableCollections()) {
    if (
      collections[colName].metadata.redirectFrom &&
      collections[colName].metadata.redirectFrom.includes(slug)
    ) {
      return colName;
    }
  }
  return null;
}

/**
 * handleTwoSegmentRedirect(collection, slug):
 * For routes like /services/web-design => check if "services" or "web-design" 
 * is an alias, or if the item doesn't exist => 404, etc.
 */
export function handleTwoSegmentRedirect(collection, slug) {
  let targetCollection = collection;
  let targetSlug = slug;

  // 1) collection alias
  const actualCollection = findCollectionRedirectAlias(targetCollection);
  if (actualCollection) {
    targetCollection = actualCollection;
  }

  // 2) item-level alias
  const itemRedirect = findItemRedirect(targetCollection, targetSlug);
  if (itemRedirect) {
    targetCollection = itemRedirect.collection;
    targetSlug = itemRedirect.targetSlug;
  }

  // 3) does that item exist now?
  const items = collections[targetCollection]?.data || [];
  const found = items.some((x) => x.slug === targetSlug);
  if (!found) {
    return "/404";
  }

  // 4) if we changed anything, we do a redirect
  if (targetCollection !== collection || targetSlug !== slug) {
    return `/${targetCollection}/${targetSlug}`;
  }

  return null; // no redirect needed
}

/**
 * handleSingleSegmentRedirect(slug):
 * For routes like /web-development => check if it's an alias or if the item belongs 
 * to a "two-segment" collection => redirect. If belongs to "single-segment" => no redirect (null).
 */
export function handleSingleSegmentRedirect(slug) {
  // 1) collection-level redirect (e.g. "service" => "services")
  const collRedirect = findCollectionRedirect(slug);
  if (collRedirect) {
    return `/${collRedirect}`;
  }

  // 2) item-level redirect
  const itemRedirect = findItemRedirect(null, slug);
  if (itemRedirect) {
    return `/${itemRedirect.collection}/${itemRedirect.targetSlug}`;
  }

  // 3) check if the slug is an actual item in any collection
  for (const colName of getAvailableCollections()) {
    const colObj = collections[colName];
    const item = colObj.data.find((x) => x.slug === slug);
    if (item) {
      // found a match
      const isSingle = colObj.metadata.collectionSlugInItem === false;
      if (isSingle) {
        // single-segment => no redirect needed => return null
        return null;
      } else {
        // two-segment => must redirect to /colName/slug
        return `/${colName}/${slug}`;
      }
    }
  }

  // 4) no match => 404
  return "/404";
}
