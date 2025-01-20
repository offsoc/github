import {BackgroundImageSchema} from '@github-ui/swp-core/schemas/contentful/contentTypes/backgroundImage'
import {PrimerComponentCardSchema} from '@github-ui/swp-core/schemas/contentful/contentTypes/primerComponentCard'
import {PrimerComponentCtaBannerSchema} from '@github-ui/swp-core/schemas/contentful/contentTypes/primerComponentCtaBanner'
import {PrimerComponentFaqGroupSchema} from '@github-ui/swp-core/schemas/contentful/contentTypes/primerComponentFaqGroup'
import {PrimerComponentHeroSchema} from '@github-ui/swp-core/schemas/contentful/contentTypes/primerComponentHero'
import {PrimerComponentPillarSchema} from '@github-ui/swp-core/schemas/contentful/contentTypes/primerComponentPillar'
import {PrimerComponentRiverSchema} from '@github-ui/swp-core/schemas/contentful/contentTypes/primerComponentRiver'
import {PrimerComponentRiverBreakoutSchema} from '@github-ui/swp-core/schemas/contentful/contentTypes/primerComponentRiverBreakout'
import {PrimerComponentSectionIntroSchema} from '@github-ui/swp-core/schemas/contentful/contentTypes/primerComponentSectionIntro'
import {PrimerComponentSubnavSchema} from '@github-ui/swp-core/schemas/contentful/contentTypes/primerComponentSubnav'
import {PrimerComponentTestimonialSchema} from '@github-ui/swp-core/schemas/contentful/contentTypes/primerComponentTestimonial'
import {buildEntrySchemaFor} from '@github-ui/swp-core/schemas/contentful/entry'
import {z} from 'zod'

export const TemplateF2Schema = buildEntrySchemaFor('templateF2', {
  fields: z.object({
    subnav: PrimerComponentSubnavSchema.optional(),
    hero: PrimerComponentHeroSchema,
    heroBackgroundImage: BackgroundImageSchema.optional(),
    sectionIntro: PrimerComponentSectionIntroSchema.optional(),
    pillars: z.array(PrimerComponentPillarSchema).optional(),
    rivers: z.array(z.union([PrimerComponentRiverSchema, PrimerComponentRiverBreakoutSchema])),
    testimonials: z.array(PrimerComponentTestimonialSchema).optional(),
    ctaBanner: PrimerComponentCtaBannerSchema,
    cardsHeading: z.string().optional(),
    cards: z.array(PrimerComponentCardSchema).optional(),
    faq: PrimerComponentFaqGroupSchema.optional(),
  }),
})
