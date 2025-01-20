import {z} from 'zod'

import {buildEntrySchemaFor} from '../entry'

export const PageSettingsSchema = buildEntrySchemaFor('pageSettings', {
  fields: z.object({
    colorMode: z.enum(['light', 'dark']).default('light'),
  }),
})

export type PageSettings = z.infer<typeof PageSettingsSchema>
