import {z} from 'zod'
import {buildEntrySchemaFor} from '../entry'
import {RichTextSchema} from '../richText'
import {AssetSchema} from './asset'
import {PersonSchema} from './person'

export const PrimerComponentTestimonialSchema = buildEntrySchemaFor('primerComponentTestimonial', {
  fields: z.object({
    quote: RichTextSchema,
    size: z.enum(['small', 'large']),
    author: PersonSchema.optional(),
    logo: AssetSchema.optional(),
  }),
})

export type PrimerComponentTestimonial = z.infer<typeof PrimerComponentTestimonialSchema>

export const isPrimerTestimonial = (entry: unknown): entry is PrimerComponentTestimonial => {
  return PrimerComponentTestimonialSchema.safeParse(entry).success
}
