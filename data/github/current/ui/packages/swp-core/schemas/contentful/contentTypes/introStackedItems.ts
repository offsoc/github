import {z} from 'zod'
import {buildEntrySchemaFor} from '../entry'
import {IntroItemSchema} from './introItem'
import {LinkSchema} from './link'

export const IntroStackedItemsSchema = buildEntrySchemaFor('introStackedItems', {
  fields: z.object({
    headline: z.string(),
    items: z.array(IntroItemSchema),
    link: LinkSchema,
  }),
})

export type IntroStackedItems = z.infer<typeof IntroStackedItemsSchema>
