import {z} from 'zod'
import {buildEntrySchemaFor} from '../entry'
import {RichTextSchema} from '../richText'
import {LinkSchema} from './link'
import {AppStoreButtonSchema} from './appStoreButton'

export const PrimerComponentCtaBannerSchema = buildEntrySchemaFor('primerComponentCtaBanner', {
  fields: z.object({
    align: z.enum(['start', 'center']),
    heading: z.string(),
    description: RichTextSchema,
    hasBorder: z.boolean().optional(),
    hasShadow: z.boolean().optional(),
    hasBackground: z.boolean().optional(),
    callToActionPrimary: LinkSchema,
    callToActionSecondary: LinkSchema,
    trailingComponent: z.array(AppStoreButtonSchema).optional(),
  }),
})

export type PrimerComponentCtaBanner = z.infer<typeof PrimerComponentCtaBannerSchema>
