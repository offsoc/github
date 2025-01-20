import {z} from 'zod'
import {buildEntrySchemaFor} from '@github-ui/swp-core/schemas/contentful/entry'
import {PrimerComponentHeroSchema} from '@github-ui/swp-core/schemas/contentful/contentTypes/primerComponentHero'
import {BackgroundImageSchema} from '@github-ui/swp-core/schemas/contentful/contentTypes/backgroundImage'
import {PrimerComponentSectionIntroSchema} from '@github-ui/swp-core/schemas/contentful/contentTypes/primerComponentSectionIntro'
import {PrimerCardsSchema} from '@github-ui/swp-core/schemas/contentful/contentTypes/primerCards'
import {PrimerComponentCtaBannerSchema} from '@github-ui/swp-core/schemas/contentful/contentTypes/primerComponentCtaBanner'
import {FeaturedBentoSchema} from '@github-ui/swp-core/schemas/contentful/contentTypes/featuredBento'

export const TemplateOverviewSchema = buildEntrySchemaFor('solutionsTemplateOverview', {
  fields: z.object({
    hero: PrimerComponentHeroSchema,
    heroBackgroundImage: BackgroundImageSchema,
    companySizeSectionIntro: PrimerComponentSectionIntroSchema,
    companySizeSectionSolutions: PrimerCardsSchema,
    companySizeSectionFeaturedSolution: FeaturedBentoSchema,
    industrySectionIntro: PrimerComponentSectionIntroSchema,
    industrySectionSolutions: PrimerCardsSchema,
    useCaseSectionIntro: PrimerComponentSectionIntroSchema,
    useCaseSectionSolutions: PrimerCardsSchema,
    featuredCustomerStoriesHeadline: z.string().optional(),
    featuredCustomerStories: PrimerCardsSchema.optional(),
    ctaBanner: PrimerComponentCtaBannerSchema,
  }),
})

export type OverviewTemplate = z.infer<typeof TemplateOverviewSchema>
