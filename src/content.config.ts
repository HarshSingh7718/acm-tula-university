import { defineCollection } from "astro:content";
import { file } from "astro/loaders";
import { z } from "astro/zod";

const board = defineCollection({
  loader: file("src/content/board.json"),
  schema: z.object({
    id: z.string(),
    fullName: z.string(),
    position: z.string(),
    yearBranch: z.string().optional(),
    initials: z.string().optional(),
    photo: z.string().optional(),
    quote: z.string().optional(),
  }),
});

const about = defineCollection({
  loader: file("src/content/about.json"),
  schema: z.object({
    id: z.string(),
    title: z.string(),
    tag: z.string(),
    description: z.string(),
    hologram: z.string(),
    stats: z
      .array(
        z.object({
          label: z.string(),
          value: z.string(),
        }),
      )
      .optional(),
  }),
});

const events = defineCollection({
  loader: file("src/content/events.json"),
  schema: z.object({
    id: z.string(),
    title: z.string(),
    category: z.string(),
    date: z.string(),
    location: z.string(),
    description: z.string(),
    tag: z.string(),
    image: z.string(),
  }),
});

const gallery = defineCollection({
  loader: file("src/content/gallery.json"),
  schema: z.object({
    id: z.string(),
    title: z.string(),
    category: z.string(),
    tag: z.string(),
    date: z.string(),
    count: z.string(),
    description: z.string(),
  }),
});

export const collections = { board, about, events, gallery };
