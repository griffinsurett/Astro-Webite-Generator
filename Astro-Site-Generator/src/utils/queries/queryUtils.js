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
        href: `/${colName}/${itm.slug}`,
      }));
    }
  
    // Hierarchical approach
    const nodeMap = new Map(
      items.map((itm) => [
        itm.slug,
        {
          label: itm[labelField] || itm.title,
          href: `/${colName}/${itm.slug}`,
          children: [],
        },
      ])
    );
  
    // Build tree
    for (const itm of items) {
      const node = nodeMap.get(itm.slug);
      if (!itm.parent || itm.parent.length === 0) continue;
  
      for (const parentSlug of itm.parent) {
        const parentNode = nodeMap.get(parentSlug);
        if (parentNode) {
          parentNode.children.push(node);
        }
      }
    }
  
    // Collect top-level
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
    const { name, queryItemText, addItemsToQuery, setChildrenUnderParents } = queryDef;
  
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
        !!setChildrenUnderParents
      );
  
      // If we have a root link & want to nest under that root
      if (metadata.hasPage && setChildrenUnderParents) {
        const rootItem = existingQuery.items.find((x) => x.href === `/${colName}`);
        if (rootItem) {
          rootItem.children = childMenuNodes;
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
  