import { glob } from 'astro/loaders';
import { defineCollection, z } from 'astro:content';

export const collections = {
	blog: defineCollection({
		// Load Markdown files in the src/content/blog directory.
		loader: glob({ base: './src/content/blog', pattern: ['**/*.md', '**/*.mdx'] }),
		schema: z.object({
			title: z.string(),
			publishDate: z.coerce.date(),
			description: z.string(),
			img: z.string(),
			img_alt: z.string().optional(),
			tags: z.array(z.string()),
			reading_time: z.string(),
		}),
	}),
};
