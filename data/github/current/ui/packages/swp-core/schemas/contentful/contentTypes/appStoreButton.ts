import {z} from 'zod'

import {buildEntrySchemaFor} from '../entry'
import {LinkSchema} from './link'

export const AppStoreButtonSchema = buildEntrySchemaFor('appStoreButton', {
  fields: z.object({
    storeOs: z.literal('Android').or(z.literal('iOS')),
    link: LinkSchema,
  }),
})

export type AppStoreButton = z.infer<typeof AppStoreButtonSchema>
