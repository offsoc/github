import {z} from 'zod'
import {buildEntrySchemaFor} from '../entry'
import {RichTextSchema} from '../richText'

const PrimerComponentTimelineBlockSchema = buildEntrySchemaFor('primerComponentTimelineBlock', {
  fields: z.object({
    text: RichTextSchema,
  }),
})

export const PrimerComponentTimelineSchema = buildEntrySchemaFor('primerComponentTimeline', {
  fields: z.object({
    blocks: z.array(PrimerComponentTimelineBlockSchema),
    hasFullWidth: z.boolean().optional(),
  }),
})

export type PrimerComponentTimeline = z.infer<typeof PrimerComponentTimelineSchema>
