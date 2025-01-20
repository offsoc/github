import {z} from 'zod'
import {buildEntrySchemaFor} from '../entry'
import {PrimerComponentTestimonialSchema} from './primerComponentTestimonial'

export const PrimerTestimonialsSchema = buildEntrySchemaFor('primerTestimonials', {
  fields: z.object({
    testimonials: z.array(PrimerComponentTestimonialSchema),
  }),
})

export type PrimerTestimonials = z.infer<typeof PrimerTestimonialsSchema>
