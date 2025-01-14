// src/utils/collections/HierarchicalUtils.js

/**
 * findChildren: returns all direct children of `item` (based on `parent` field).
 */
export function findChildren(item, items) {
    // Return all items that list `item.slug` as their parent
    return items.filter((i) => i.parent === item.slug);
  }
  
  /**
   * findParents: returns all ancestors of `item`, climbing upward until no parent.
   * Produces an array like [immediateParent, grandParent, ...].
   */
  export function findParents(item, items) {
    const parents = [];
    let current = item;
  
    while (current && current.parent) {
      // find the direct parent
      const parentItem = items.find((i) => i.slug === current.parent);
      if (parentItem) {
        parents.push(parentItem);
        current = parentItem; // move up the chain
      } else {
        break;
      }
    }
  
    return parents;
  }
  
  /**
   * findSiblings: returns all items with the same parent as `item`,
   * excluding the item itself.
   */
  export function findSiblings(item, items) {
    if (!item.parent) return [];
    return items.filter((i) => i.parent === item.parent && i.slug !== item.slug);
  }
  