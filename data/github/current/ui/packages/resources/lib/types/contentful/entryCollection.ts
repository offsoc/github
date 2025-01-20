import {z} from 'zod'

/**
 * This is a very basic schema to ensure the resolveResponse function from
 * the 'contentful-resolve-response' package returns an collection of objects
 * that somewhat resembles the shape of a Contentful entry.
 */
export const EntryCollection = z.array(z.object({}).passthrough()).min(1)

export type EntryCollection = z.infer<typeof EntryCollection>

export function toEntryCollection(collection: unknown): EntryCollection {
  return EntryCollection.parse(collection)
}
