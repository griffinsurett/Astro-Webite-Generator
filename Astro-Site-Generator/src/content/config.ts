import { defineCollection, z } from "astro:content";

/** ------------------------------------------------------------------
 * Base schema for items
 * Now includes optional `addToQuery` so single items can also specify
 * how they appear in e.g., NavMenu.
 * ------------------------------------------------------------------ */
const sectionSchema = z.object({
  collection: z.string(),
  queryName: z.string(),
});

const addToQueryItemSchema = z.object({
  name: z.string(),
  queryItemText: z.string().optional(),
});

const baseSchema = z.object({
  title: z.string(),
  subtitle: z.string().optional(),
  slug: z
    .string()
    .regex(
      /^[a-z0-9-]+$/,
      "Invalid slug format. Must contain only lowercase letters, numbers, and hyphens."
    ),
  description: z.string(),
  icon: z.string().optional(),
  featuredImage: z.string().url().optional(),
  hasPage: z.boolean().optional(),
  featured: z.boolean().optional(),
  redirectFrom: z.array(z.string()).optional(),
  parent: z.array(z.string()).optional(),
  addToQuery: z
    .array(
      z.object({
        name: z.string(),
        queryItemText: z.string().optional(),
      })
    )
    .optional(),
  sections: z
    .array(
      z.object({
        collection: z.string(),
        queryName: z.string(),
      })
    )
    .optional(),
  crawl: z.boolean().optional().default(true),

  /** New `link` property with custom validation */
  link: z
    .string()
    .refine(
      (val) => {
        // Allow only specific URL schemes: tel:, mailto:
        return /^(tel:|mailto:)[\w\-.\+]+@?[\w\-.\+]+$/.test(val);
      },
      {
        message: "Link must start with tel: or mailto: and be a valid format.",
      }
    )
    .optional(),
});

/** ------------------------------------------------------------------
 * Extended schema for the collection-level metadata
 * Now includes `itemsSections` for assigning section templates to all items.
 * ------------------------------------------------------------------ */
const collectionMetadataQuerySchema = z.object({
  name: z.string(),
  queryItemText: z.string().optional(),
  addItemsToQuery: z.boolean().optional(),
  addHierarchyToQuery: z.boolean().optional(),
});

const collectionMetadataSchema = z.object({
  title: z.string(),
  subtitle: z.string().optional(),
  description: z.string(),
  icon: z.string().optional(),
  featuredImage: z.string().optional(),
  hasPage: z.boolean(),
  itemsHasPage: z.boolean(),
  redirectFrom: z.array(z.string()).optional(),
  isHierarchical: z.boolean().optional(),
  addToQuery: z.array(collectionMetadataQuerySchema).optional(),
  sections: z.array(sectionSchema).optional(),
  itemsSections: z.array(sectionSchema).optional(),
  collectionSlugInItem: z.boolean().default(true),
});

/* ------------------------------------------------------------------
   SERVICES COLLECTION
   - Mark isHierarchical as true.
   - Use the `parent` field in items to define child -> parent relationships.
------------------------------------------------------------------ */
const services = defineCollection({
  schema: baseSchema,
  metadata: collectionMetadataSchema.parse({
    title: "Services",
    subtitle: "Our offerings to help your business grow",
    description: "A collection of services, e.g., SEO, web design, dev, etc.",
    icon: "🔍",
    featuredImage: "/assets/background.svg",
    hasPage: true,
    itemsHasPage: true,
    redirectFrom: ["service"],
    isHierarchical: true,
    collectionSlugInItem: false,
    addToQuery: [
      {
        name: "NavMenu",
        queryItemText: "title",
        addItemsToQuery: true,
        addHierarchyToQuery: true,
      },
    ],
    sections: [
      { collection: "services", queryName: "AllItemsServices" },
      { collection: "projects", queryName: "RelatedProjects" },
      { collection: "testimonials", queryName: "RelatedTestimonials" },
    ],
    itemsSections: [
      { collection: "projects", queryName: "AllItemsProjects" },
      { collection: "testimonials", queryName: "AllItemsTestimonials" },
      { collection: "services", queryName: "RelatedServices" },
    ],
  }),
  data: [
    {
      title: "Website Creation",
      subtitle: "All-in-one site building solution",
      slug: "website-creation",
      description: "Launch modern websites with design and dev included.",
      icon: "🌐",
      featuredImage: "/assets/background.svg",
      sections: [
        { collection: "services", queryName: "RelatedServices" },
        { collection: "services", queryName: "AllItemsServices" },
        { collection: "projects", queryName: "RelatedProjects" },
        { collection: "testimonials", queryName: "RelatedTestimonials" },
      ],
    },
    {
      title: "Web Design",
      subtitle: "Crafting beautiful site layouts",
      slug: "web-design",
      description:
        "Professional design services focusing on aesthetics and UX.",
      icon: "🎨",
      featuredImage: "/assets/background.svg",
      featured: true,
      parent: ["website-creation", "digital-marketing"],
    },
    {
      title: "Web Development",
      subtitle: "Modern, responsive websites",
      slug: "web-development",
      description: "Professional dev services for scalability and performance.",
      icon: "🖥️",
      featuredImage: "/assets/background.svg",
      featured: true,
      redirectFrom: ["web-dev", "development"],
      parent: "website-creation",
    },
    {
      title: "Digital Marketing",
      subtitle: "Broaden your online reach",
      slug: "digital-marketing",
      description:
        "Grow audience and brand visibility through strategic campaigns.",
      icon: "📈",
      featuredImage: "/assets/background.svg",
    },
    // Child of Digital Marketing
    {
      title: "SEO Optimization",
      subtitle: "Improve your site’s visibility",
      slug: "seo-optimization",
      description: "Optimize your website to rank higher and attract visitors.",
      icon: "🔍",
      featuredImage: "/assets/background.svg",
      featured: true,
      redirectFrom: ["seo"],
      parent: "digital-marketing",
    },
  ],
});

/* ------------------------------------------------------------------
   PROJECTS COLLECTION (unchanged, not hierarchical)
------------------------------------------------------------------ */
const projects = defineCollection({
  schema: baseSchema.extend({
    services: z.array(z.string()).optional(),
  }),
  metadata: collectionMetadataSchema.parse({
    title: "Projects",
    subtitle: "Showcase of our work",
    description: "A portfolio of projects demonstrating our capabilities.",
    icon: "🔍",
    featuredImage: "../assets/background.svg",
    hasPage: true,
    itemsHasPage: true,
    redirectFrom: ["project"],
    // isHierarchical is NOT set here (false by default)
    addToQuery: [
      {
        name: "NavMenu",
        queryItemText: "title",
        addItemsToQuery: false,
        addHierarchyToQuery: false,
      },
    ],
    sections: [
      { collection: "projects", queryName: "AllItemsProjects" },
      { collection: "testimonials", queryName: "RelatedTestimonials" },
      { collection: "services", queryName: "RelatedServices" },
    ],
    itemsSections: [
      { collection: "testimonials", queryName: "AllItemsTestimonials" },
    ],
  }),
  data: [
    {
      title: "Project Alpha",
      subtitle: "A revolutionary tech project",
      slug: "project-alpha",
      description: "Groundbreaking project revolutionizing technology.",
      icon: "🚀",
      featuredImage: "/assets/background.svg",
      services: ["web-development", "seo-optimization"],
      featured: true,
    },
    {
      title: "Project Beta",
      subtitle: "A creative design project",
      slug: "project-beta",
      description: "An innovative project with cutting-edge design.",
      icon: "🎨",
      featuredImage: "/assets/background.svg",
      services: ["web-development", "digital-marketing"],
    },
  ],
});

/* ------------------------------------------------------------------
   TESTIMONIALS COLLECTION (unchanged, not hierarchical)
------------------------------------------------------------------ */
const testimonials = defineCollection({
  schema: baseSchema.extend({
    projects: z.array(z.string()).optional(),
  }),
  metadata: collectionMetadataSchema.parse({
    title: "Testimonials",
    subtitle: "Client testimonials from past projects",
    description: "What our clients say about our work.",
    icon: "💬",
    featuredImage: "/assets/background.svg",
    hasPage: true,
    itemsHasPage: false,
    redirectFrom: ["testimonial"],
    addToQuery: [
      {
        name: "NavMenu",
        queryItemText: "title",
        addItemsToQuery: false,
        addHierarchyToQuery: false,
      },
    ],
    sections: [
      { collection: "testimonials", queryName: "AllItemsTestimonials" },
      { collection: "projects", queryName: "RelatedProjects" },
      { collection: "services", queryName: "RelatedServices" },
    ],
  }),
  data: [
    {
      title: "Testimonial for Project Alpha",
      slug: "alpha-testimonial",
      description: "Client feedback on Project Alpha’s success.",
      icon: "💬",
      featuredImage: "/assets/background.svg",
      projects: ["project-alpha"],
      featured: true,
    },
    {
      title: "Testimonial for Project Beta #1",
      slug: "beta-testimonial-1",
      description: "First testimonial praising Project Beta’s design.",
      icon: "💬",
      featuredImage: "/assets/background.svg",
      projects: ["project-beta"],
      featured: true,
    },
    {
      title: "Testimonial for Project Beta #2",
      slug: "beta-testimonial-2",
      description: "Another testimonial praising Project Beta’s results.",
      icon: "💬",
      featuredImage: "/assets/background.svg",
      projects: ["project-beta"],
      // hasPage: true,
    },
  ],
});

/* ------------------------------------------------------------------
   CONTACT COLLECTION
   - Each item represents a distinct contact method (e.g., Phone, Email).
   - Items do not have individual pages (`itemsHasPage: false`).
   - Collection does not have a main contact page (`hasPage: false`).
------------------------------------------------------------------ */
const contact = defineCollection({
  metadata: {
    title: "Contact",
    subtitle: "Get in Touch",
    description: "Our contact information for support and inquiries.",
    icon: "📞",
    featuredImage: "/assets/contact-background.svg",
    hasPage: true,
    itemsHasPage: false,
    redirectFrom: [],
    isHierarchical: false,
    sections: [
      { collection: "contact", queryName: "AllItemsContact" },
    ],
    addToQuery: [
      {
        name: "NavMenu",
        queryItemText: "title",
        addItemsToQuery: false,
        addHierarchyToQuery: false,
      },
    ],
  },
  data: [
    {
      title: "123-456-7890",
      description: "Call us at 123-456-7890 for immediate assistance.",
      icon: "📞",
      featured: true,
      phone: "123-456-7890",
      link: "tel:123-456-7890", // Adding the link property
    },
    {
      title: "support@example.com",
      slug: "email-us",
      description: "Send your inquiries to support@example.com.",
      icon: "📧",
      featured: true,
      email: "support@example.com",
      link: "mailto:support@example.com", // Adding the link property
    },
    // Add more contact items as needed
  ],
});

export const collections = {
  services,
  projects,
  testimonials,
  contact,
};

// Homepage sections configuration
export const homepageSections = [
  {
    collection: "services",
    queryName: "FeaturedServices",
  },
  {
    collection: "projects",
    queryName: "FeaturedProjects",
  },
  {
    collection: "testimonials",
    queryName: "FeaturedTestimonials",
  },
  { 
    collection: "contact", 
    queryName: "AllItemsContact" 
  },
];
