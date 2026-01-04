import { z } from 'zod';

export const textQuoteSelectorSchema = z.object({
  type: z.literal('TextQuoteSelector'),
  exact: z.string(),
  prefix: z.string().optional(),
  suffix: z.string().optional(),
});

export const textPositionSelectorSchema = z.object({
  type: z.literal('TextPositionSelector'),
  start: z.number().int().nonnegative(),
  end: z.number().int().nonnegative(),
});

export const fragmentSelectorSchema = z.object({
  type: z.literal('FragmentSelector'),
  conformsTo: z.string().url(),
  value: z.string(),
});

export const cssSelectorSchema = z.object({
  type: z.literal('CssSelector'),
  value: z.string(),
});

export const xpathSelectorSchema = z.object({
  type: z.literal('XPathSelector'),
  value: z.string(),
});

export const baseSelectorSchema = z.discriminatedUnion('type', [
  textQuoteSelectorSchema,
  textPositionSelectorSchema,
  fragmentSelectorSchema,
  cssSelectorSchema,
  xpathSelectorSchema,
]);

export const rangeSelectorSchema: z.ZodType<any> = z.lazy(() =>
  z.object({
    type: z.literal('RangeSelector'),
    startSelector: selectorSchema,
    endSelector: selectorSchema,
  })
);

export const selectorSchema = z.union([baseSelectorSchema, rangeSelectorSchema]);
