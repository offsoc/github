import {z} from 'zod'
import {buildEntrySchemaFor} from '../entry'
import {RichTextSchema} from '../richText'

export const PrimerComponentLogoSuiteSchema = buildEntrySchemaFor('primerComponentLogoSuite', {
  fields: z.object({
    heading: z.string(),
    visuallyHideHeading: z.boolean().optional(),
    description: RichTextSchema.optional(),
    marquee: z.literal('off').or(z.literal('slow')).or(z.literal('normal')).optional(),
    hasDivider: z.boolean().optional(),
    variant: z.literal('muted').or(z.literal('emphasis')).optional(),
    align: z.literal('start').or(z.literal('center')).or(z.literal('justify')).optional(),
    logos: z.array(z.string()),
  }),
})

export type PrimerComponentLogoSuite = z.infer<typeof PrimerComponentLogoSuiteSchema>

export const isPrimerLogoSuite = (entry: unknown): entry is PrimerComponentLogoSuite => {
  return PrimerComponentLogoSuiteSchema.safeParse(entry).success
}
