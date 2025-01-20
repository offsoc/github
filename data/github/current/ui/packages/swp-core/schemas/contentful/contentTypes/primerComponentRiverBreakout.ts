import {z} from 'zod'
import {buildEntrySchemaFor} from '../entry'
import {RichTextSchema} from '../richText'
import {AssetSchema} from './asset'
import {LinkSchema} from './link'
import {PrimerComponentTimelineSchema} from './primerComponentTimeline'

export const PrimerComponentRiverBreakoutSchema = buildEntrySchemaFor('primerComponentRiverBreakout', {
  fields: z.object({
    a11yHeading: z.string(),
    text: RichTextSchema,
    trailingComponent: PrimerComponentTimelineSchema.optional(),
    callToAction: LinkSchema.optional(),
    image: AssetSchema.optional(),
    imageAlt: z.string().optional(),
    hasShadow: z.boolean().optional(),
  }),
})

export type PrimerComponentRiverBreakout = z.infer<typeof PrimerComponentRiverBreakoutSchema>

export function isRiverBreakout(river: unknown): river is PrimerComponentRiverBreakout {
  return PrimerComponentRiverBreakoutSchema.safeParse(river).success
}
