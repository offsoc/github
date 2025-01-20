import {z} from 'zod'
import {buildEntrySchemaFor} from '@github-ui/swp-core/schemas/contentful/entry'
import {PrimerCardsSchema} from '@github-ui/swp-core/schemas/contentful/contentTypes/primerCards'
import {PrimerComponentCtaBannerSchema} from '@github-ui/swp-core/schemas/contentful/contentTypes/primerComponentCtaBanner'
import {PrimerComponentFaqGroupSchema} from '@github-ui/swp-core/schemas/contentful/contentTypes/primerComponentFaqGroup'
import {PrimerComponentHeroSchema} from '@github-ui/swp-core/schemas/contentful/contentTypes/primerComponentHero'
import {PrimerComponentLogoSuiteSchema} from '@github-ui/swp-core/schemas/contentful/contentTypes/primerComponentLogoSuite'
import {PrimerComponentRiverSchema} from '@github-ui/swp-core/schemas/contentful/contentTypes/primerComponentRiver'
import {PrimerComponentTestimonialSchema} from '@github-ui/swp-core/schemas/contentful/contentTypes/primerComponentTestimonial'
import {IntroPillarsSchema} from '@github-ui/swp-core/schemas/contentful/contentTypes/introPillars'
import {IntroStackedItemsSchema} from '@github-ui/swp-core/schemas/contentful/contentTypes/introStackedItems'
import {PrimerComponentStatisticSchema} from '@github-ui/swp-core/schemas/contentful/contentTypes/primerComponentStatistic'
import {FeaturedBentoSchema} from '@github-ui/swp-core/schemas/contentful/contentTypes/featuredBento'

export const TemplateDetailSchema = buildEntrySchemaFor('solutionsTemplateDetail', {
  fields: z.object({
    hero: PrimerComponentHeroSchema,
    introSectionContent: z.union([IntroPillarsSchema, IntroStackedItemsSchema]),
    logoSuite: PrimerComponentLogoSuiteSchema.optional(),
    featuresSectionRivers: z.array(PrimerComponentRiverSchema).optional(),
    featuresSectionRiversRiverStoryScroll: z.boolean().optional(),
    featuredCustomerBento: FeaturedBentoSchema.optional(),
    statistics: z.array(PrimerComponentStatisticSchema).optional(),
    customerStoriesSectionHeadline: z.string().optional(),
    featuredCustomerStories: PrimerCardsSchema.optional(),
    testimonial: PrimerComponentTestimonialSchema.optional(),
    ctaBanner: PrimerComponentCtaBannerSchema.optional(),
    furtherReadingSectionHeadline: z.string().optional(),
    resources: PrimerCardsSchema.optional(),
    faq: PrimerComponentFaqGroupSchema.optional(),
  }),
})
