// src/content/queries.js
import { generateCollectionQueries } from "../utils/queries/CollectionQueries.js";

/** 1) Your static queries */
const STATIC_QUERIES = [
  {
    name: "NavMenu",
    description: "Main navigation menu items",
    items: [
      { label: "Home", href: "/" },
      { label: "Services", href: "/services" },
      { label: "Projects", href: "/projects" },
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

/** 2) Generate dynamic queries for each collection */
const COLLECTION_QUERIES = generateCollectionQueries();

/** 3) Combine both into a single export */
export const QUERIES = [
  ...STATIC_QUERIES,
  ...COLLECTION_QUERIES,
];

console.log(QUERIES)

