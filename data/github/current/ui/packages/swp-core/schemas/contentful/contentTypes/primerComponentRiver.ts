import {z} from 'zod'
import {buildEntrySchemaFor} from '../entry'
import {RichTextSchema} from '../richText'
import {AssetSchema} from './asset'
import {LinkSchema} from './link'
import {PrimerComponentTimelineSchema} from './primerComponentTimeline'

export const PrimerComponentRiverSchema = buildEntrySchemaFor('primerComponentRiver', {
  fields: z.object({
    align: z.enum(['start', 'center', 'end']),
    imageTextRatio: z.enum(['50:50', '60:40']),
    heading: z.string(),
    text: RichTextSchema,
    trailingComponent: PrimerComponentTimelineSchema.optional(),
    callToAction: LinkSchema.optional(),
    image: AssetSchema.optional(),
    imageAlt: z.string().optional(),
    videoSrc: z.string().optional(),
    hasShadow: z.boolean().optional(),
  }),
})

export type PrimerComponentRiver = z.infer<typeof PrimerComponentRiverSchema>
