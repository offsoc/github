import type {z} from 'zod'
import {buildPageSchemaForTemplate} from '@github-ui/swp-core/schemas/contentful/contentTypes/containerPage'
import {TemplateArticleSchema, TemplateArticleTrucatedSchema} from './templateResourcesArticle'

const ArticlePageSchema = buildPageSchemaForTemplate(TemplateArticleSchema)
const CategoryPageSchema = buildPageSchemaForTemplate(TemplateArticleTrucatedSchema)

export type ArticlePageContainer = z.infer<typeof ArticlePageSchema>
export type CategoryPageContainer = z.infer<typeof CategoryPageSchema>

export function toArticlePage(item: unknown): ArticlePageContainer {
  return ArticlePageSchema.parse(item)
}

export function toCategoryPage(items: unknown[]): CategoryPageContainer[] {
  return items.map(item => CategoryPageSchema.parse(item))
}
