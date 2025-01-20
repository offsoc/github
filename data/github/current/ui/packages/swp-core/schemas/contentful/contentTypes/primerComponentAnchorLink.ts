import {z} from 'zod'
import {buildEntrySchemaFor} from '../entry'

export const PrimerComponentAnchorLinkSchema = buildEntrySchemaFor('primerComponentAnchorLink', {
  fields: z.object({
    id: z.string(),
    text: z.string(),
  }),
})

export type PrimerComponentAnchorLink = z.infer<typeof PrimerComponentAnchorLinkSchema>
