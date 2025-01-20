import {PrimerComponentFaqGroupSchema} from '@github-ui/swp-core/schemas/contentful/contentTypes/primerComponentFaqGroup'
import {buildEntrySchemaFor} from '@github-ui/swp-core/schemas/contentful/entry'
import {z} from 'zod'

export const TemplateFeaturesCopilotSchema = buildEntrySchemaFor('templateFeaturesCopilot', {
  fields: z.object({
    faqGroup: PrimerComponentFaqGroupSchema,
  }),
})

export type templateFeaturesCopilot = z.infer<typeof TemplateFeaturesCopilotSchema>
