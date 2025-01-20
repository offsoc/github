import {LinkSchema} from '@github-ui/swp-core/schemas/contentful/contentTypes/link'
import {buildEntrySchemaFor} from '@github-ui/swp-core/schemas/contentful/entry'
import {RichTextSchema} from '@github-ui/swp-core/schemas/contentful/richText'
import {z} from 'zod'

const BaseFormFieldSchema = z.object({
  name: z.string(),
  label: z.string(),
  placeholder: z.string().optional(),
  required: z.boolean().optional(),
})

export const TemplateUniverse23WaitlistSchema = buildEntrySchemaFor('templateUniverse23Waitlist', {
  fields: z.object({
    body: RichTextSchema.optional(),
    formName: z.string(),
    headline: z.string(),
    hiddenFormFields: z.record(z.string()).optional(),
    label: z.string().optional(),
    theme: z.union([z.literal('ai'), z.literal('collaboration'), z.literal('security')]).optional(),
    thankYouHeadline: z.string().optional(),
    thankYouBody: RichTextSchema.optional(),
    thankYouCta: LinkSchema.optional(),
    thankYouLoggedOutCta: LinkSchema.optional(),
    signInBanner: RichTextSchema.optional(),
    /**
     * We currently support the following types of fields:
     *
     * - Simple text inputs:
     *
     *  {
     *    type: 'text',
     *    name: 'title',
     *    label: 'Job Title',
     *    placeholder: 'e.g. Software Engineer',
     *    required: true,
     *  }
     *
     * - Simple number inputs:
     *
     *  {
     *    type: 'number',
     *    name: 'yearsOfExperience',
     *    label: 'Years of experience',
     *    required: true,
     *  }
     *
     * - Radio buttons:
     *
     *  {
     *    type: 'radios',
     *    name: 'number_developers',
     *    label: 'Number of developers',
     *    options: {
     *      '0_10': '0-10',
     *      '10_50': '10-50',
     *      '50_100': '50-100',
     *      '_100': 'More than 100',
     *    },
     *    required: true,
     *  }
     *
     * - Group of checkboxes
     *
     *  {
     *    label: "I'm interested in",
     *    name: 'github_product_of_interest',
     *    type: 'checkboxes',
     *    options: {
     *      code_scanning_autofix: 'Code Scanning: Autofix',
     *      secret_scanning_regex: 'Secret Scanning: Regular Expression Generator for Custom Patterns',
     *      secret_scanning_generic_secrets: 'Secret Scanning: Generic Secrets (Passwords)',
     *    },
     *  },
     *
     */
    additionalFormFields: z
      .array(
        z.discriminatedUnion('type', [
          BaseFormFieldSchema.extend({type: z.enum(['text', 'number'])}),
          BaseFormFieldSchema.extend({type: z.literal('radios'), options: z.record(z.string())}),
          BaseFormFieldSchema.extend({type: z.literal('checkboxes'), options: z.record(z.string())}),
        ]),
      )
      .optional(),
  }),
})

export type TemplateUniverse23Waitlist = z.infer<typeof TemplateUniverse23WaitlistSchema>
