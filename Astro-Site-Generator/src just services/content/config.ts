// src/content/config.ts
import { defineCollection, z } from 'astro:content';

// Base schema with common fields
const baseSchema = z.object({
  title: z.string(),
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/, 'Invalid slug format. Must contain only lowercase letters, numbers, and hyphens.'),
  description: z.string(),
});

// Define the 'services' collection by extending the base schema
const services = defineCollection({
  // Using the Content Layer API's loader configuration
  type: 'content', // Explicitly specify the collection type
  schema: baseSchema.extend({
    icon: z.string().optional(),
  }),
});

// Export all collections
export const collections = { services };
