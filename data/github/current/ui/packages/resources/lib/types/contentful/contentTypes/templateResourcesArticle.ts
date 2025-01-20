import {z} from 'zod'
import {BackgroundImageSchema} from '@github-ui/swp-core/schemas/contentful/contentTypes/backgroundImage'
import {buildEntrySchemaFor} from '@github-ui/swp-core/schemas/contentful/entry'
import {PrimerCardsSchema} from '@github-ui/swp-core/schemas/contentful/contentTypes/primerCards'
import {PrimerComponentCtaBannerSchema} from '@github-ui/swp-core/schemas/contentful/contentTypes/primerComponentCtaBanner'
import {PrimerComponentFaqGroupSchema} from '@github-ui/swp-core/schemas/contentful/contentTypes/primerComponentFaqGroup'
import {PrimerComponentProseSchema} from '@github-ui/swp-core/schemas/contentful/contentTypes/primerComponentProse'
import {RichTextSchema} from '@github-ui/swp-core/schemas/contentful/richText'
import {GenericCallToActionSchema} from '@github-ui/swp-core/schemas/contentful/contentTypes/genericCallToAction'

export const TemplateArticleSchema = buildEntrySchemaFor('templateResourcesArticle', {
  fields: z.object({
    title: z.string(),
    heroBackgroundImage: BackgroundImageSchema.optional(),
    lede: RichTextSchema,
    content: PrimerComponentProseSchema,
    featuredCallToAction: GenericCallToActionSchema.optional(),
    ctaBanner: PrimerComponentCtaBannerSchema.optional(),
    cards: PrimerCardsSchema.optional(),
    faq: PrimerComponentFaqGroupSchema.optional(),
    excerpt: RichTextSchema,
    brand: z
      .union([
        z.literal('AI'),
        z.literal('Collaboration'),
        z.literal('Enterprise'),
        z.literal('Productivity'),
        z.literal('Security'),
      ])
      .optional(),
  }),
})

// smaller version to support caching in BE
// see https://github.com/github/marketing-platform-services/issues/3261
export const TemplateArticleTrucatedSchema = buildEntrySchemaFor('templateResourcesArticle', {
  fields: z.object({
    title: z.string(),
    heroBackgroundImage: BackgroundImageSchema.optional(),
    excerpt: RichTextSchema,
  }),
})

export type ArticlePage = z.infer<typeof TemplateArticleSchema>
export type ArticlePageTruncated = z.infer<typeof TemplateArticleTrucatedSchema>
