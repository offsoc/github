import {z} from 'zod'
import {buildEntrySchemaFor} from '../entry'
import {LinkSchema} from './link'
import {AssetSchema} from './asset'
import {CardIconColors} from '@primer/react-brand'
import {RichTextSchema} from '../richText'

export const FeaturedBentoSchema = buildEntrySchemaFor('featuredBento', {
  fields: z.object({
    title: z.string(),
    heading: RichTextSchema,
    link: LinkSchema,
    icon: z.string().optional(),
    iconColor: z.enum(CardIconColors).optional(),
    image: AssetSchema.optional(),
  }),
})

export type FeaturedBentoType = z.infer<typeof FeaturedBentoSchema>
