// src/content/site.config.ts
import { z } from 'astro:content';

// Define the schema for site settings using Zod
const siteConfigSchema = z.object({
  title: z.string(),
  description: z.string(),
  logo: z.string(), // Path to your logo (relative to the public directory)
  favicon: z.string(), // Path to your favicon (relative to the public directory)
  // Add more settings as needed
});

// Define the actual site configuration
const siteConfig = siteConfigSchema.parse({
  title: "Your Site Title",
  description: "A brief description of your site.",
  logo: "/assets/transparent-bg-pronto.png", // Correct absolute path
  favicon: "/assets/transparent-bg-pronto.png", // Correct absolute path
  // Add more settings as needed
});

export default siteConfig;
