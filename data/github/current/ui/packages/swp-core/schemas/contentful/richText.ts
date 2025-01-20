import {BLOCKS, type Document} from '@contentful/rich-text-types'
import {z} from 'zod'

export const RichTextSchema: z.ZodType<Document> = z.object({
  nodeType: z.literal(BLOCKS.DOCUMENT),
  data: z.object({}),
  content: z.array(z.any()),
})

export type RichText = z.infer<typeof RichTextSchema>
