import { defineCollection, z } from "astro:content";

const projectCollection = defineCollection({
  schema: ({ image }) => z.object({
    inProgress: z.boolean(),
    title: z.string(),
    description: z.string(),
    img: image().refine((img) => img.width >= 400, {
      message: "Cover image must be at least 400 pixels wide!",
    }),
    img_alt: z.string(),
    link: z.string(),
    demo: z.string(),
    tags: z.array(z.string())
  }),
});

export const collections = {
  projects: projectCollection,
};