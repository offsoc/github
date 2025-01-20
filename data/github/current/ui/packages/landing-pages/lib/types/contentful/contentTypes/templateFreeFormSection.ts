import {AssetSchema} from '@github-ui/swp-core/schemas/contentful/contentTypes/asset'
import {PrimerCardsSchema} from '@github-ui/swp-core/schemas/contentful/contentTypes/primerCards'
import {PrimerComponentAnchorNavSchema} from '@github-ui/swp-core/schemas/contentful/contentTypes/primerComponentAnchorNav'
import {PrimerComponentCtaBannerSchema} from '@github-ui/swp-core/schemas/contentful/contentTypes/primerComponentCtaBanner'
import {PrimerComponentFaqSchema} from '@github-ui/swp-core/schemas/contentful/contentTypes/primerComponentFaq'
import {PrimerComponentFaqGroupSchema} from '@github-ui/swp-core/schemas/contentful/contentTypes/primerComponentFaqGroup'
import {PrimerComponentHeroSchema} from '@github-ui/swp-core/schemas/contentful/contentTypes/primerComponentHero'
import {PrimerComponentProseSchema} from '@github-ui/swp-core/schemas/contentful/contentTypes/primerComponentProse'
import {PrimerComponentRiverSchema} from '@github-ui/swp-core/schemas/contentful/contentTypes/primerComponentRiver'
import {PrimerComponentRiverBreakoutSchema} from '@github-ui/swp-core/schemas/contentful/contentTypes/primerComponentRiverBreakout'
import {PrimerComponentSectionIntroSchema} from '@github-ui/swp-core/schemas/contentful/contentTypes/primerComponentSectionIntro'
import {PrimerComponentSubnavSchema} from '@github-ui/swp-core/schemas/contentful/contentTypes/primerComponentSubnav'
import {PrimerComponentTimelineSchema} from '@github-ui/swp-core/schemas/contentful/contentTypes/primerComponentTimeline'
import {PrimerPillarsSchema} from '@github-ui/swp-core/schemas/contentful/contentTypes/primerPillars'
import {PrimerTestimonialsSchema} from '@github-ui/swp-core/schemas/contentful/contentTypes/primerTestimonials'
import {buildEntrySchemaFor} from '@github-ui/swp-core/schemas/contentful/entry'
import {z} from 'zod'

export const TemplateFreeFormSectionSchema = buildEntrySchemaFor('templateFreeFormSection', {
  fields: z.object({
    id: z.string().optional(),
    components: z.array(
      z.union([
        PrimerComponentAnchorNavSchema,
        PrimerCardsSchema,
        PrimerComponentHeroSchema,
        PrimerComponentSectionIntroSchema,
        PrimerComponentRiverSchema,
        PrimerComponentRiverBreakoutSchema,
        PrimerComponentFaqGroupSchema,
        PrimerComponentFaqSchema,
        PrimerComponentCtaBannerSchema,
        PrimerPillarsSchema,
        PrimerComponentProseSchema,
        PrimerTestimonialsSchema,
        PrimerComponentTimelineSchema,
        PrimerComponentSubnavSchema,
      ]),
    ),
    colorMode: z.enum(['inherit', 'light', 'dark']).default('inherit'),
    image: AssetSchema.optional(),
    imageMaxWidth: z.number().optional(),
  }),
})

export type TemplateFreeFormSection = z.infer<typeof TemplateFreeFormSectionSchema>
