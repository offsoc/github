import {z} from 'zod'

/**
 * A function to build a zod schema for a Contentful entry.
 *
 * @param contentType The Contentful content type ID
 * @param options Additional options to build the schema
 * @param options.fields A zod schema representing the fields of the entry
 */
export function buildEntrySchemaFor<C extends z.Primitive, F extends z.ZodTypeAny>(
  contentType: C,
  options: {
    fields: F
  },
) {
  return z.object({
    sys: z.object({
      id: z.string(),

      contentType: z.object({
        sys: z.object({
          id: z.literal(contentType),
        }),
      }),
    }),
    fields: options.fields,
  })
}
