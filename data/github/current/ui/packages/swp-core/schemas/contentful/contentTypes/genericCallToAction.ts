import {z} from 'zod'
import {buildEntrySchemaFor} from '../entry'
import {RichTextSchema} from '../richText'
import {LinkSchema} from './link'

export const GenericCallToActionSchema = buildEntrySchemaFor('genericCallToAction', {
  fields: z.object({
    heading: z.string(),
    description: RichTextSchema,
    callToActionPrimary: LinkSchema,
  }),
})

export type GenericCallToAction = z.infer<typeof GenericCallToActionSchema>
