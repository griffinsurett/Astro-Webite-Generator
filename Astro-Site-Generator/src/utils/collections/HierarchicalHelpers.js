// src/utils/collections/HierarchicalUtils.js

/**
 * findChildren: returns all direct children of `item` (based on `parent` field).
 * Supports multiple parents.
 */
export function findChildren(currentItem, allItems) {
  // If the current item’s slug is "website-creation",
  // we want any item whose parent array includes "website-creation".
  const mySlug = currentItem.slug;

  return allItems.filter((possibleChild) => {
    if (!possibleChild.parent) return false;

    // If possibleChild.parent is an array, does it include mySlug?
    const parentSlugs = Array.isArray(possibleChild.parent)
      ? possibleChild.parent
      : [possibleChild.parent];

    return parentSlugs.includes(mySlug);
  });
}

/**
 * findParents: returns all ancestors of `item`, climbing upward until no parent.
 * Supports multiple parents.
 * Produces an array like [immediateParent1, immediateParent2, grandParent1, grandParent2, ...].
 */
export function findParents(item, items) {
  const parents = [];
  const parentQueue = Array.isArray(item.parent) ? [...item.parent] : item.parent ? [item.parent] : [];

  while (parentQueue.length > 0) {
    const currentParentSlug = parentQueue.shift();
    const parentItem = items.find((i) => i.slug === currentParentSlug);

    if (parentItem) {
      parents.push(parentItem);
      if (parentItem.parent) {
        const newParents = Array.isArray(parentItem.parent) ? parentItem.parent : [parentItem.parent];
        parentQueue.push(...newParents);
      }
    }
  }

  return parents;
}

/**
 * findSiblings: returns all items with at least one common parent as `item`,
 * excluding the item itself.
 * Supports multiple parents.
 */
/**
 * findSiblings: returns all items that share at least one parent slug with `item`,
 * excluding the item itself. If `item` has no parent (top-level), it returns
 * the other top-level items.
 * Supports multiple parents.
 */
export function findSiblings(item, items) {
  // 1) If the item has **no parent**, return top-level siblings
  if (!item.parent || item.parent.length === 0) {
    return items.filter((other) => {
      if (other.slug === item.slug) return false;
      // "Top-level" means no parent field or empty array
      return !other.parent || other.parent.length === 0;
    });
  }

  // 2) Otherwise, do the normal “share the same parent slug” logic
  const parentSlugs = Array.isArray(item.parent)
    ? item.parent
    : [item.parent];

  return items.filter((other) => {
    if (other.slug === item.slug || !other.parent) return false;
    const otherParents = Array.isArray(other.parent)
      ? other.parent
      : [other.parent];

    // “Sibling” if there's at least one parent slug in common
    return otherParents.some((pSlug) => parentSlugs.includes(pSlug));
  });
}

