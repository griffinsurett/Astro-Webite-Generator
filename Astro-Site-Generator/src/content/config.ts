// src/content/config.ts
import { defineCollection, z } from 'astro:content';

// Base schema with common fields
const baseSchema = z.object({
  title: z.string(),
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/, 'Invalid slug format. Must contain only lowercase letters, numbers, and hyphens.')
    .optional(),
  description: z.string(),
  icon: z.string().optional(), // Moved icon to base schema
  featuredImage: z.string().optional(),  // Added featuredImage to base schema
});

// Define the 'services' collection using the base schema
const services = defineCollection({
  type: 'content',
  schema: baseSchema, // No extensions needed
});

// Define the 'projects' collection using the base schema
const projects = defineCollection({
  type: 'content',
  schema: baseSchema, // No extensions needed
});

// Export all collections
export const collections = { services, projects };
