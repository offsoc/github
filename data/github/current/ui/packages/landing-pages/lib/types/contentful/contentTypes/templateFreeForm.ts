import {buildEntrySchemaFor} from '@github-ui/swp-core/schemas/contentful/entry'
import {z} from 'zod'

import {TemplateFreeFormSectionSchema} from './templateFreeFormSection'

export const TemplateFreeFormSchema = buildEntrySchemaFor('templateFreeForm', {
  fields: z.object({
    sections: z.array(TemplateFreeFormSectionSchema),
  }),
})

export type TemplateFreeForm = z.infer<typeof TemplateFreeFormSchema>
