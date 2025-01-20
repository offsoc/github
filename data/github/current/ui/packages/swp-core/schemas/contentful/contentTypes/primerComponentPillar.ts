import {z} from 'zod'
import {buildEntrySchemaFor} from '../entry'
import {RichTextSchema} from '../richText'
import {LinkSchema} from './link'

export const PrimerComponentPillarSchema = buildEntrySchemaFor('primerComponentPillar', {
  fields: z.object({
    align: z.enum(['start', 'center']),
    icon: z.string().optional(),
    heading: z.string(),
    description: RichTextSchema,
    link: LinkSchema.optional(),
  }),
})

export type PrimerComponentPillar = z.infer<typeof PrimerComponentPillarSchema>
