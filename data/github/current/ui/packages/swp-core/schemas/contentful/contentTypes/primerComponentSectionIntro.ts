import {z} from 'zod'
import {buildEntrySchemaFor} from '../entry'
import {RichTextSchema} from '../richText'
import {LinkSchema} from './link'

export const PrimerComponentSectionIntroSchema = buildEntrySchemaFor('primerComponentSectionIntro', {
  fields: z.object({
    align: z.literal('start').or(z.literal('center')),
    description: RichTextSchema.optional(),
    fullWidth: z.boolean().optional(),
    heading: RichTextSchema,
    link: LinkSchema.optional(),
  }),
})

export type PrimerComponentSectionIntro = z.infer<typeof PrimerComponentSectionIntroSchema>
