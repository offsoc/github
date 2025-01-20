import {z} from 'zod'
import {buildEntrySchemaFor} from '../entry'
import {AssetSchema} from './asset'

export const BackgroundImageSchema = buildEntrySchemaFor('backgroundImage', {
  fields: z.object({
    image: AssetSchema,
    focus: z
      .union([
        z.literal('bottom'),
        z.literal('bottom left'),
        z.literal('bottom right'),
        z.literal('center'),
        z.literal('left'),
        z.literal('right'),
        z.literal('top'),
        z.literal('top left'),
        z.literal('top right'),
      ])
      .optional(),
    colorMode: z.union([z.literal('inherit'), z.literal('dark'), z.literal('light')]).optional(),
  }),
})

export type BackgroundImage = z.infer<typeof BackgroundImageSchema>
