import {z} from 'zod'
import {buildEntrySchemaFor} from '../entry'
import {AssetSchema} from './asset'

export const PersonSchema = buildEntrySchemaFor('person', {
  fields: z.object({
    fullName: z.string(),
    position: z.string().optional(),
    photo: AssetSchema.optional(),
  }),
})
