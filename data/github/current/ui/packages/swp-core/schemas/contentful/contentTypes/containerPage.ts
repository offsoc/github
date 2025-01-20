import {z} from 'zod'

import {buildEntrySchemaFor} from '../entry'
import {PageSettingsSchema} from './pageSettings'

export function buildPageSchemaForTemplate<Template extends z.ZodTypeAny>(templateSchema: Template) {
  return buildEntrySchemaFor('containerPage', {
    fields: z.object({
      path: z.string(),
      settings: PageSettingsSchema.optional(),
      template: templateSchema,
      title: z.string(),
    }),
  })
}
