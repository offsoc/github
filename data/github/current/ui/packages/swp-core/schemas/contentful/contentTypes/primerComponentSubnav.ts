import {z} from 'zod'
import {buildEntrySchemaFor} from '../entry'
import {LinkSchema} from './link'
import {LinkGroupSchema} from './linkGroup'

export const PrimerComponentSubnavSchema = buildEntrySchemaFor('primerComponentSubnav', {
  fields: z.object({
    cta: LinkSchema.optional(),
    heading: LinkSchema,
    links: z.array(LinkSchema.or(LinkGroupSchema)),
  }),
})

export type PrimerComponentSubnav = z.infer<typeof PrimerComponentSubnavSchema>
