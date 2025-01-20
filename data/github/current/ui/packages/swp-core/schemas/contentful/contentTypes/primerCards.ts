import {z} from 'zod'
import {buildEntrySchemaFor} from '../entry'
import {PrimerComponentCardSchema} from './primerComponentCard'

export const PrimerCardsSchema = buildEntrySchemaFor('primerCards', {
  fields: z.object({
    cards: z.array(PrimerComponentCardSchema),
  }),
})

export type PrimerCards = z.infer<typeof PrimerCardsSchema>
