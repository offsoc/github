import type {z} from 'zod'
import {buildPageSchemaForTemplate} from '@github-ui/swp-core/schemas/contentful/contentTypes/containerPage'
import {TemplateDetailSchema} from './templates/detail'
import {TemplateOverviewSchema} from './templates/overview'
import {TemplateCategorySchema} from './templates/category'

const DetailPageSchema = buildPageSchemaForTemplate(TemplateDetailSchema)
export type DetailPageContainer = z.infer<typeof DetailPageSchema>

const OverviewPageSchema = buildPageSchemaForTemplate(TemplateOverviewSchema)
export type OverviewPageContainer = z.infer<typeof OverviewPageSchema>

const CategoryPageSchema = buildPageSchemaForTemplate(TemplateCategorySchema)
export type CategoryPageContainer = z.infer<typeof CategoryPageSchema>

export function toOverviewPage(item: unknown): OverviewPageContainer {
  return OverviewPageSchema.parse(item)
}

export function toCategoryPage(item: unknown): CategoryPageContainer {
  return CategoryPageSchema.parse(item)
}

export function toDetailPage(item: unknown): DetailPageContainer {
  return DetailPageSchema.parse(item)
}
