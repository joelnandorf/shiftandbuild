import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: ({ image }) =>
    z
      .object({
        title: z.string(),
        description: z.string(),
        pubDate: z.coerce.date(),
        updatedDate: z.coerce.date().optional(),
        tags: z.array(z.string()).default([]),
        pillar: z.enum(['ai-arkitektur', 'tech-lead', 'rollkonvergens']),
        draft: z.boolean().default(false),
        heroImage: image().optional(),
        heroImageAlt: z.string().optional(),
      })
      .refine(data => !data.heroImage || !!data.heroImageAlt, {
        message: 'heroImageAlt is required when heroImage is set',
        path: ['heroImageAlt'],
      }),
});

export const collections = { blog };
