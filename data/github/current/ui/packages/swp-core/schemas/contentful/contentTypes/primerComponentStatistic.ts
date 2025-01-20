import {z} from 'zod'
import {buildEntrySchemaFor} from '../entry'

export const PrimerComponentStatisticSchema = buildEntrySchemaFor('primerComponentStatistic', {
  fields: z.object({
    heading: z.string(),
    size: z.enum(['small', 'medium', 'large']),
    variant: z.enum(['boxed']).optional(),
    description: z.string().optional(),
    descriptionVariant: z.enum(['default', 'muted', 'accent']),
  }),
})

export type PrimerComponentStatistic = z.infer<typeof PrimerComponentStatisticSchema>
