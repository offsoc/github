import {z} from 'zod'
import {buildEntrySchemaFor} from '../entry'
import {RichTextSchema} from '../richText'

export const IntroItemSchema = buildEntrySchemaFor('introItem', {
  fields: z.object({
    text: RichTextSchema,
  }),
})

export type IntroItem = z.infer<typeof IntroItemSchema>
