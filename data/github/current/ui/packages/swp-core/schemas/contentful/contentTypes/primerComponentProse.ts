import {z} from 'zod'
import {buildEntrySchemaFor} from '../entry'
import {RichTextSchema} from '../richText'

export const PrimerComponentProseSchema = buildEntrySchemaFor('primerComponentProse', {
  fields: z.object({
    text: RichTextSchema,
  }),
})

export type PrimerComponentProse = z.infer<typeof PrimerComponentProseSchema>
