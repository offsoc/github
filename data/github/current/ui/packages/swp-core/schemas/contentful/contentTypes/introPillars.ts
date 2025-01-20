import {buildEntrySchemaFor} from '../entry'
import {PrimerComponentPillarSchema} from './primerComponentPillar'
import {z} from 'zod'

export const IntroPillarsSchema = buildEntrySchemaFor('introPillars', {
  fields: z.object({
    headline: z.string(),
    pillars: z.array(PrimerComponentPillarSchema),
  }),
})

export type IntroPillars = z.infer<typeof IntroPillarsSchema>
