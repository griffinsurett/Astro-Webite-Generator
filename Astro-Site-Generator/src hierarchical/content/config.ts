import { defineCollection, z } from 'astro:content';

/**
 * Base schema for all items.
 * We add a `parent` field as a plain string (the slug of the parent).
 * You’ll interpret this field at runtime if `isHierarchical === true`.
 */
const baseSchema = z.object({
  title: z.string(),
  subtitle: z.string().optional(),
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/, 'Invalid slug format. Must contain only lowercase letters, numbers, and hyphens.'),
  description: z.string(),
  icon: z.string().optional(),
  featuredImage: z.string().url().optional(),
  hasPage: z.boolean().optional(),
  featured: z.boolean().optional(),
  redirectFrom: z.array(z.string()).optional(),
  /**
   * Optional parent slug—only relevant if the collection is hierarchical.
   * (We’ll rely on `metadata.isHierarchical` to decide if we use it.)
   */
  parent: z.string().optional(),
});

/**
 * Single metadata schema with an optional `isHierarchical` property.
 * No separate “extended” schema is needed.
 */
const collectionMetadataSchema = z.object({
  title: z.string(),
  subtitle: z.string().optional(),
  description: z.string(),
  icon: z.string().optional(),
  featuredImage: z.string().optional(),
  hasPage: z.boolean(),
  itemsHasPage: z.boolean(),
  redirectFrom: z.array(z.string()).optional(),
  isHierarchical: z.boolean().optional(), // <--- KEY: toggles hierarchy on/off
});

/* ------------------------------------------------------------------
   SERVICES COLLECTION
   - Mark isHierarchical as true.
   - Use the `parent` field in items to define child -> parent relationships.
------------------------------------------------------------------ */
const services = defineCollection({
  schema: baseSchema,
  metadata: collectionMetadataSchema.parse({
    title: 'Services',
    subtitle: 'Our offerings to help your business grow',
    description: 'A collection of services, e.g., SEO, web design, dev, etc.',
    icon: '🔍',
    featuredImage: '../assets/background.svg',
    hasPage: true,
    itemsHasPage: true,
    redirectFrom: ['service'],
    isHierarchical: true, // <--- This toggles hierarchical behavior for Services
  }),
  data: [
    // Top-level service
    {
      title: 'Website Creation',
      subtitle: 'All-in-one site building solution',
      slug: 'website-creation',
      description: 'Launch modern websites with design and dev included.',
      icon: '🌐',
      featuredImage: '../assets/background.svg',
      // No parent → top-level
    },
    // Child of Website Creation
    {
      title: 'Web Design',
      subtitle: 'Crafting beautiful site layouts',
      slug: 'web-design',
      description: 'Professional design services focusing on aesthetics and UX.',
      icon: '🎨',
      featuredImage: '../assets/background.svg',
      featured: true,
      // Because isHierarchical is true, we interpret parent as referencing another item in this same collection
      parent: 'website-creation',
    },
    // Another child of Website Creation
    {
      title: 'Web Development',
      subtitle: 'Modern, responsive websites',
      slug: 'web-development',
      description: 'Professional dev services for scalability and performance.',
      icon: '🖥️',
      featuredImage: '../assets/background.svg',
      featured: true,
      redirectFrom: ['web-dev', 'development'],
      parent: 'website-creation',
    },
    // Another top-level service
    {
      title: 'Digital Marketing',
      subtitle: 'Broaden your online reach',
      slug: 'digital-marketing',
      description: 'Grow audience and brand visibility through strategic campaigns.',
      icon: '📈',
      featuredImage: '../assets/background.svg',
    },
    // Child of Digital Marketing
    {
      title: 'SEO Optimization',
      subtitle: 'Improve your site’s visibility',
      slug: 'seo-optimization',
      description: 'Optimize your website to rank higher and attract visitors.',
      icon: '🔍',
      featuredImage: '../assets/background.svg',
      featured: true,
      redirectFrom: ['seo'],
      parent: 'digital-marketing',
    },
  ],
});

/* ------------------------------------------------------------------
   PROJECTS COLLECTION (unchanged, not hierarchical)
------------------------------------------------------------------ */
const projects = defineCollection({
  schema: baseSchema.extend({
    // For demonstration, referencing services array
    services: z.array(z.string()).optional(),
  }),
  metadata: collectionMetadataSchema.parse({
    title: 'Projects',
    subtitle: 'Showcase of our work',
    description: 'A portfolio of projects demonstrating our capabilities.',
    icon: '🔍',
    featuredImage: '../assets/background.svg',
    hasPage: true,
    itemsHasPage: true,
    redirectFrom: ['project'],
    // isHierarchical is NOT set here (false by default)
  }),
  data: [
    {
      title: 'Project Alpha',
      subtitle: 'A revolutionary tech project',
      slug: 'project-alpha',
      description: 'Groundbreaking project revolutionizing technology.',
      icon: '🚀',
      featuredImage: '../assets/background.svg',
      services: ['web-development', 'seo-optimization'],
      featured: true,
    },
    {
      title: 'Project Beta',
      subtitle: 'A creative design project',
      slug: 'project-beta',
      description: 'An innovative project with cutting-edge design.',
      icon: '🎨',
      featuredImage: '../assets/background.svg',
      services: ['web-development'],
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
    title: 'Testimonials',
    subtitle: 'Client testimonials from past projects',
    description: 'What our clients say about our work.',
    icon: '💬',
    featuredImage: '../assets/background.svg',
    hasPage: true,
    itemsHasPage: false,
    redirectFrom: ['testimonial'],
    // isHierarchical is NOT set here
  }),
  data: [
    {
      title: 'Testimonial for Project Alpha',
      slug: 'alpha-testimonial',
      description: 'Client feedback on Project Alpha’s success.',
      icon: '💬',
      featuredImage: '../assets/background.svg',
      projects: ['project-alpha'],
      featured: true,
    },
    {
      title: 'Testimonial for Project Beta #1',
      slug: 'beta-testimonial-1',
      description: 'First testimonial praising Project Beta’s design.',
      icon: '💬',
      featuredImage: '../assets/background.svg',
      projects: ['project-beta'],
    },
    {
      title: 'Testimonial for Project Beta #2',
      slug: 'beta-testimonial-2',
      description: 'Another testimonial praising Project Beta’s results.',
      icon: '💬',
      featuredImage: '../assets/background.svg',
      projects: ['project-beta'],
    },
  ],
});

export const collections = {
  services,
  projects,
  testimonials,
};
