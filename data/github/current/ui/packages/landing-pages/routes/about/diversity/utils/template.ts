import {PrimerComponentCtaBannerSchema} from '@github-ui/swp-core/schemas/contentful/contentTypes/primerComponentCtaBanner'
import {PrimerComponentHeroSchema} from '@github-ui/swp-core/schemas/contentful/contentTypes/primerComponentHero'
import {PrimerComponentRiverSchema} from '@github-ui/swp-core/schemas/contentful/contentTypes/primerComponentRiver'
import {PrimerComponentSectionIntroSchema} from '@github-ui/swp-core/schemas/contentful/contentTypes/primerComponentSectionIntro'
import {PrimerPillarsSchema} from '@github-ui/swp-core/schemas/contentful/contentTypes/primerPillars'
import {z} from 'zod'

import {TemplateFreeFormSchema, TemplateFreeFormSectionSchema} from '../../../../lib/types/contentful'

export const DiversityTemplateSchema = TemplateFreeFormSchema.extend({
  fields: z.object({
    sections: z.tuple([
      TemplateFreeFormSectionSchema.extend({
        fields: z.object({
          components: z.tuple([PrimerComponentHeroSchema]),
        }),
      }),

      TemplateFreeFormSectionSchema.extend({
        fields: z.object({
          components: z.tuple([PrimerComponentRiverSchema, PrimerComponentSectionIntroSchema, PrimerPillarsSchema]),
        }),
      }),

      TemplateFreeFormSectionSchema.extend({
        fields: z.object({
          components: z.tuple([PrimerComponentRiverSchema, PrimerComponentSectionIntroSchema, PrimerPillarsSchema]),
        }),
      }),

      TemplateFreeFormSectionSchema.extend({
        fields: z.object({
          components: z.tuple([PrimerComponentRiverSchema, PrimerPillarsSchema]),
        }),
      }),

      TemplateFreeFormSectionSchema.extend({
        fields: z.object({
          components: z.tuple([PrimerComponentRiverSchema, PrimerPillarsSchema]),
        }),
      }),

      TemplateFreeFormSectionSchema.extend({
        fields: z.object({
          components: z.tuple([PrimerComponentCtaBannerSchema]),
        }),
      }),
    ]),
  }),
})

export type DiversityTemplate = z.infer<typeof DiversityTemplateSchema>

export function toDiversityTemplate(entry: unknown): DiversityTemplate {
  return DiversityTemplateSchema.parse(entry)
}
