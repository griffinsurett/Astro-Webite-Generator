// src/content/site.config.ts
import { z } from 'astro:content';

// Define the schema for site settings using Zod
const siteConfigSchema = z.object({
  title: z.string(),
  description: z.string(),
  logo: z.string(), // Path to your logo (relative to the public directory)
  favicon: z.string(), // Path to your favicon (relative to the public directory)
  navigation: z.array(
    z.object({
      name: z.string(),
      href: z
        .string()
        .regex(
          /^\/[A-Za-z0-9\-\/]*$/,
          'Invalid href format. Must start with a "/" and contain only letters, numbers, hyphens, or slashes.'
        ),
    })
  ),
  footer: z.object({
    text: z.string(),
    links: z.array(
      z.object({
        name: z.string(),
        href: z
          .string()
          .regex(
            /^\/[A-Za-z0-9\-\/]*$/,
            'Invalid href format. Must start with a "/" and contain only letters, numbers, hyphens, or slashes.'
          ),
      })
    ),
  }),
  // Add more settings as needed
});

// Define the actual site configuration
const siteConfig = siteConfigSchema.parse({
  title: "Your Site Title",
  description: "A brief description of your site.",
  logo: "/assets/transparent-bg-pronto.png", // Correct absolute path
  favicon: "/assets/transparent-bg-pronto.png", // Correct absolute path
  navigation: [
    { name: "Home", href: "/" },
    { name: "Services", href: "/services" },
    { name: "Projects", href: "/projects" },
    // Add more navigation links as needed
  ],
  footer: {
    text: "© 2025 Your Company. All rights reserved.",
    links: [
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms of Service", href: "/terms" },
      // Add more footer links as needed
    ],
  },
  // Add more settings as needed
});

export default siteConfig;
