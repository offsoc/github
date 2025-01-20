import {z} from 'zod'
import {buildEntrySchemaFor} from '@github-ui/swp-core/schemas/contentful/entry'
import {PrimerComponentHeroSchema} from '@github-ui/swp-core/schemas/contentful/contentTypes/primerComponentHero'
import {PrimerComponentCtaBannerSchema} from '@github-ui/swp-core/schemas/contentful/contentTypes/primerComponentCtaBanner'
import {PrimerComponentStatisticSchema} from '@github-ui/swp-core/schemas/contentful/contentTypes/primerComponentStatistic'
import {PrimerCardsSchema} from '@github-ui/swp-core/schemas/contentful/contentTypes/primerCards'

export const TemplateCategorySchema = buildEntrySchemaFor('solutionsTemplateCategory', {
  fields: z.object({
    hero: PrimerComponentHeroSchema,
    solutionPageCards: PrimerCardsSchema,
    relatedSolutionCards: PrimerCardsSchema.optional(),
    featuredStatistics: z.array(PrimerComponentStatisticSchema).optional(),
    ctaBanner: PrimerComponentCtaBannerSchema,
  }),
})

export type CategoryTemplate = z.infer<typeof TemplateCategorySchema>
