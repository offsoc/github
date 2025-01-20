import {z} from 'zod'
import {buildEntrySchemaFor} from '../entry'
import {AssetSchema} from '../../../../swp-core/schemas/contentful/contentTypes/asset'
import {RichTextSchema} from '../richText'
import {CardIconColors} from '@primer/react-brand'

export const PrimerComponentCardSchema = buildEntrySchemaFor('primerComponentCard', {
  fields: z.object({
    href: z.string(),
    heading: z.string(),
    description: RichTextSchema.optional(),
    ctaText: z.string().optional(),
    icon: z.string().optional(),
    iconColor: z.enum(CardIconColors).optional(),
    iconBackground: z.boolean().optional(),
    variant: z.enum(['default', 'minimal']).optional(),
    label: z.string().optional(),
    image: AssetSchema.optional(),
  }),
})

export type PrimerComponentCard = z.infer<typeof PrimerComponentCardSchema>
