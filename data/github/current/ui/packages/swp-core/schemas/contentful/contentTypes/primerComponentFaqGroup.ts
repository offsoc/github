import {z} from 'zod'
import {buildEntrySchemaFor} from '../entry'
import {PrimerComponentFaqSchema} from './primerComponentFaq'

export const PrimerComponentFaqGroupSchema = buildEntrySchemaFor('primerComponentFaqGroup', {
  fields: z.object({
    heading: z.string(),
    faqs: z.array(PrimerComponentFaqSchema).optional(),
  }),
})

export type PrimerComponentFaqGroup = z.infer<typeof PrimerComponentFaqGroupSchema>
