// src/utils/queries/queryUtils.js

/**
 * buildMenuItemsFromCollection:
 * If `setChildren = true`, build a hierarchy based on `parent`.
 * Otherwise, return a flat array of { label, href }.
 */
export function buildMenuItemsFromCollection(items, colName, labelField = "title", setChildren = false) {
  if (!setChildren) {
    return items.map((itm) => ({
      label: itm[labelField] || itm.title,
      href: itm.link ? itm.link : `/${colName}/${itm.slug}`,
      external: /^https?:\/\//i.test(itm.link || ''),
    }));
  }

  // Hierarchical approach
  const nodeMap = new Map(
    items.map((itm) => [
      itm.slug,
      {
        label: itm[labelField] || itm.title,
        href: itm.link ? itm.link : `/${colName}/${itm.slug}`,
        external: /^https?:\/\//i.test(itm.link || ''),
        children: [],
      },
    ])
  );

  // Assign children to their respective parents
  for (const itm of items) {
    if (!itm.parent) continue;

    const parentSlugs = Array.isArray(itm.parent) ? itm.parent : [itm.parent];

    for (const parentSlug of parentSlugs) {
      const parentNode = nodeMap.get(parentSlug);
      if (parentNode) {
        parentNode.children.push(nodeMap.get(itm.slug));
      } else {
        console.warn(`Parent slug "${parentSlug}" not found in collection "${colName}".`);
      }
    }
  }

  // Collect top-level nodes (those without parents)
  const topNodes = [];
  for (const itm of items) {
    if (!itm.parent || itm.parent.length === 0) {
      topNodes.push(nodeMap.get(itm.slug));
    }
  }

  return topNodes;
}
  
  /**
   * handleCollectionLevelAddToQuery:
   * Merges the entire collection (root link, items, hierarchy) if specified.
   */
  export function handleCollectionLevelAddToQuery(existingQuery, colObj, colName, queryDef, buildMenuItemsFromCollection) {
    const { metadata, data } = colObj;
    const { name, queryItemText, addItemsToQuery, addHierarchyToQuery } = queryDef;
  
    // Always add root link if `hasPage` is true
    if (metadata.hasPage) {
      existingQuery.items.push({
        label: metadata.title,
        href: `/${colName}`,
        children: [],
      });
    }
  
    // If addItemsToQuery is true, add all items
    if (addItemsToQuery) {
      const childMenuNodes = buildMenuItemsFromCollection(
        data,
        colName,
        queryItemText || "title",
        !!addHierarchyToQuery // Use addHierarchyToQuery instead of setChildrenUnderParents
      );
  
      // If we have a root link & want to nest under that root
      if (metadata.hasPage && addHierarchyToQuery) {
        const rootItem = existingQuery.items.find((x) => x.href === `/${colName}`);
        if (rootItem) {
          // Merge children to prevent duplication if multiple parents exist
          const uniqueChildrenMap = new Map();
          childMenuNodes.forEach((child) => {
            if (!uniqueChildrenMap.has(child.href)) {
              uniqueChildrenMap.set(child.href, child);
            }
          });
          rootItem.children = [...rootItem.children, ...Array.from(uniqueChildrenMap.values())];
        }
      } else {
        // Flatten
        existingQuery.items.push(...childMenuNodes);
      }
    }
  }
  
  /**
   * handleSingleItemAddToQuery:
   * For items that have item-level addToQuery => merges just that item
   */
  export function handleSingleItemAddToQuery(existingQuery, item, colName, queryDef) {
    const { queryItemText } = queryDef;
    const labelField = queryItemText || "title";
  
    existingQuery.items.push({
      label: item[labelField] || item.title,
      href: `/${colName}/${item.slug}`,
    });
  }
  
  /**
   * mergeCollectionItemsIntoStaticQueries:
   * 1) Merges collection-level addToQuery
   * 2) Then merges item-level addToQuery for each item
   */
  export function mergeCollectionItemsIntoStaticQueries(collections, STATIC_QUERIES, buildMenuItemsFromCollection, handleCollectionLevelAddToQuery, handleSingleItemAddToQuery) {
    for (const [colName, colObj] of Object.entries(collections)) {
      const { metadata, data } = colObj;
  
      // 1) If collection-level addToQuery exists
      if (metadata.addToQuery) {
        for (const queryDef of metadata.addToQuery) {
          let existingQuery = STATIC_QUERIES.find((q) => q.name === queryDef.name);
          if (!existingQuery) {
            existingQuery = { name: queryDef.name, items: [] };
            STATIC_QUERIES.push(existingQuery);
          }
          handleCollectionLevelAddToQuery(existingQuery, colObj, colName, queryDef, buildMenuItemsFromCollection);
        }
      }
  
      // 2) Then check each item for item-level addToQuery
      for (const item of data) {
        if (!item.addToQuery) continue;
        for (const itemQueryDef of item.addToQuery) {
          let existingQuery = STATIC_QUERIES.find((q) => q.name === itemQueryDef.name);
          if (!existingQuery) {
            existingQuery = { name: itemQueryDef.name, items: [] };
            STATIC_QUERIES.push(existingQuery);
          }
          // Add just this single item
          handleSingleItemAddToQuery(existingQuery, item, colName, itemQueryDef);
        }
      }
    }
  }
  