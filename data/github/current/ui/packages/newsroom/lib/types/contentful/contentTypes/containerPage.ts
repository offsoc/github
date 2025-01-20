import type {z} from 'zod'
import {buildPageSchemaForTemplate} from '@github-ui/swp-core/schemas/contentful/contentTypes/containerPage'
import {TemplateHomeSchema} from './templates'

const HomePageSchema = buildPageSchemaForTemplate(TemplateHomeSchema)
export type HomePageContainer = z.infer<typeof HomePageSchema>

export function toHomePage(item: unknown): HomePageContainer {
  return HomePageSchema.parse(item)
}
