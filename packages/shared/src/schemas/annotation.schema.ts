import { z } from 'zod';
import { selectorSchema } from './selector.schema.js';

export const annotationMotivationSchema = z.enum([
  'highlighting',
  'tagging',
  'classifying',
  'commenting',
  'describing',
  'linking',
  'questioning',
  'bookmarking',
]);

export const agentSchema = z.object({
  id: z.string().url(),
  type: z.enum(['Person', 'Organization', 'Software']),
  name: z.string().optional(),
  nickname: z.string().optional(),
  email: z.string().email().optional(),
});

export const textualBodySchema = z.object({
  type: z.literal('TextualBody'),
  value: z.string(),
  format: z.string().optional(),
  language: z.string().optional(),
  purpose: z.enum(['tagging', 'describing', 'commenting', 'replying']).optional(),
});

export const specificResourceSchema = z.object({
  type: z.literal('SpecificResource'),
  source: z.string().url(),
  purpose: z.enum(['tagging', 'classifying', 'identifying', 'describing']).optional(),
  selector: selectorSchema.optional(),
});

export const annotationBodySchema = z.union([
  textualBodySchema,
  specificResourceSchema,
  z.string().url(),
]);

export const annotationTargetSchema = z.object({
  source: z.string().url(),
  selector: z.union([selectorSchema, z.array(selectorSchema)]).optional(),
});

export const annotationSchema = z.object({
  '@context': z.union([z.string(), z.array(z.string())]),
  id: z.string(),
  type: z.union([z.literal('Annotation'), z.array(z.string())]),
  motivation: z.union([annotationMotivationSchema, z.array(annotationMotivationSchema)]),
  creator: agentSchema.optional(),
  created: z.string().datetime().optional(),
  modified: z.string().datetime().optional(),
  body: z.union([annotationBodySchema, z.array(annotationBodySchema)]).optional(),
  target: z.union([annotationTargetSchema, z.array(annotationTargetSchema), z.string().url()]),
}).passthrough(); // Allow custom properties

export const annotationPageSchema = z.object({
  '@context': z.union([z.string(), z.array(z.string())]),
  id: z.string().url(),
  type: z.literal('AnnotationPage'),
  partOf: z.string().url().optional(),
  next: z.string().url().optional(),
  prev: z.string().url().optional(),
  startIndex: z.number().int().nonnegative().optional(),
  items: z.array(annotationSchema),
});

export const annotationCollectionSchema = z.object({
  '@context': z.union([z.string(), z.array(z.string())]),
  id: z.string().url(),
  type: z.literal('AnnotationCollection'),
  label: z.string().optional(),
  total: z.number().int().nonnegative().optional(),
  first: z.union([annotationPageSchema, z.string().url()]).optional(),
  last: z.union([annotationPageSchema, z.string().url()]).optional(),
});
