import {PrimerComponentFaqGroupSchema} from '@github-ui/swp-core/schemas/contentful/contentTypes/primerComponentFaqGroup'
import {z} from 'zod'

import {TemplateFreeFormSchema, TemplateFreeFormSectionSchema} from '../../../lib/types/contentful'

export const AdvancedSecurityTemplateSchema = TemplateFreeFormSchema.extend({
  fields: z.object({
    sections: z.tuple([
      TemplateFreeFormSectionSchema.extend({
        fields: z.object({
          components: z.tuple([PrimerComponentFaqGroupSchema]),
        }),
      }),
    ]),
  }),
})

export type AdvancedSecurityTemplate = z.infer<typeof AdvancedSecurityTemplateSchema>

export function toAdvancedSecurityTemplate(entry: unknown): AdvancedSecurityTemplate | undefined {
  const result = AdvancedSecurityTemplateSchema.safeParse(entry)

  return result.success ? result.data : undefined
}
