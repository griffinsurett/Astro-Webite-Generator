// src/utils/collections/HierarchicalUtils.js

/**
 * findChildren: returns all direct children of `item` (based on `parent` field).
 * Supports multiple parents.
 */
export function findChildren(item, items) {
  // If the current item's parent is an array, check if any of the parents match
  const parentSlugs = Array.isArray(item.parent) ? item.parent : [item.parent];
  
  // Return all items that list any of `parentSlugs` as their parent
  return items.filter((i) => {
    if (!i.parent) return false;
    const childParents = Array.isArray(i.parent) ? i.parent : [i.parent];
    return childParents.some((pSlug) => parentSlugs.includes(pSlug));
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
export function findSiblings(item, items) {
  if (!item.parent) return [];
  const parentSlugs = Array.isArray(item.parent) ? item.parent : [item.parent];

  return items.filter((i) => {
    if (i.slug === item.slug || !i.parent) return false;
    const siblingParents = Array.isArray(i.parent) ? i.parent : [i.parent];
    return siblingParents.some((pSlug) => parentSlugs.includes(pSlug));
  });
}
