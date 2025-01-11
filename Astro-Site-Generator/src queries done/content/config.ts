// src/content/config.ts
import { defineCollection, z, reference } from 'astro:content';

// Enhanced base schema for all items
const baseSchema = z.object({
  title: z.string(),
  subtitle: z.string().optional(),
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/, 'Invalid slug format. Must contain only lowercase letters, numbers, and hyphens.'),
  description: z.string(),
  icon: z.string().optional(),
  featuredImage: z.string().url().optional(),
  hasPage: z.boolean().optional(), // Per-item override for `hasPage`
  featured: z.boolean().optional(), // New field to mark as featured
});

// Metadata schema for collections
const collectionMetadataSchema = z.object({
  title: z.string(),
  subtitle: z.string().optional(),
  description: z.string(),
  icon: z.string().optional(),
  featuredImage: z.string().optional(),
  hasPage: z.boolean(), // Default route behavior for the collection
  itemsHasPage: z.boolean(), // Default route behavior for items in the collection
});

// Define the 'services' collection
const services = defineCollection({
  schema: baseSchema,
  metadata: collectionMetadataSchema.parse({
    title: "Services",
    subtitle: "Our offerings to help your business grow",
    description: "A collection of services provided by the company, such as SEO, web development, and more.",
    icon: "🔍",
    featuredImage: "../assets/background.svg",
    hasPage: true, // Accessible at /services
    itemsHasPage: true, // Individual services accessible at /services/:slug by default
  }),
  data: [
    {
      title: "SEO Optimization",
      subtitle: "Improve your site's visibility",
      slug: "seo-optimization",
      description: "Optimize your website to rank higher on search engines and attract more visitors.",
      icon: "🔍",
      featuredImage: "../assets/background.svg",
      featured: true, // This service is featured
    },
    {
      title: "Web Development",
      subtitle: "Build modern, responsive websites",
      slug: "web-development",
      description: "Professional web development services to build responsive and scalable websites.",
      icon: "🖥️",
      featuredImage: "../assets/background.svg",
      featured: true, // This service is featured
      // featured is optional; defaults to false if not set
    },
    // Add more services as needed
  ],
});

// Define the 'projects' collection
const projects = defineCollection({
  schema: baseSchema.extend({
    services: reference('services').array().optional(), // Multiple references
  }),
  metadata: collectionMetadataSchema.parse({
    title: "Projects",
    subtitle: "Showcase of our work",
    description: "A portfolio of projects that demonstrate our expertise and capabilities.",
    icon: "🔍",
    featuredImage: "../assets/background.svg",
    hasPage: true, // Accessible at /projects
    itemsHasPage: true, // Individual projects accessible at /projects/:slug by default
  }),
  data: [
    {
      title: "Project Alpha",
      subtitle: "A revolutionary tech project",
      slug: "project-alpha",
      description: "A groundbreaking project that revolutionizes technology.",
      icon: "🚀",
      featuredImage: "../assets/background.svg",
      services: ["web-development", "seo-optimization"], // Multiple related services
      featured: true, // This project is featured
    },
    {
      title: "Project Beta",
      subtitle: "A creative design project",
      slug: "project-beta",
      description: "An innovative project showcasing cutting-edge design.",
      icon: "🎨",
      featuredImage: "../assets/background.svg",
      services: ["web-development"], // Single service in an array
      // featured is optional; defaults to false if not set
    },
    // Add more projects as needed
  ],
});

// Export collections
export const collections = {
  services,
  projects,
};
