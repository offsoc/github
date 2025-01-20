import {PrimerComponentLogoSuiteSchema} from '@github-ui/swp-core/schemas/contentful/contentTypes/primerComponentLogoSuite'
import {PrimerComponentTestimonialSchema} from '@github-ui/swp-core/schemas/contentful/contentTypes/primerComponentTestimonial'
import {buildEntrySchemaFor} from '@github-ui/swp-core/schemas/contentful/entry'
import {RichTextSchema} from '@github-ui/swp-core/schemas/contentful/richText'
import {z} from 'zod'

export const TemplateContactSalesSchema = buildEntrySchemaFor('templateContactSalesForm', {
  fields: z.object({
    body: RichTextSchema.optional(),
    headline: z.string(),
    label: z.string().optional(),
    highlight: PrimerComponentLogoSuiteSchema.or(PrimerComponentTestimonialSchema).optional(),
    branding: z.union([z.literal('Platform'), z.literal('AI'), z.literal('Security')]).optional(),
  }),
})

export type TemplateContactSalesForm = z.infer<typeof TemplateContactSalesSchema>
