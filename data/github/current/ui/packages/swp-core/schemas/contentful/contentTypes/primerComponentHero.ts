import {z} from 'zod'

import {buildEntrySchemaFor} from '../entry'
import {AppStoreButtonSchema} from './appStoreButton'
import {AssetSchema} from './asset'
import {LinkSchema} from './link'

export const PrimerComponentHeroSchema = buildEntrySchemaFor('primerComponentHero', {
  fields: z.object({
    align: z.literal('start').or(z.literal('center')),
    label: z.string().optional(),
    heading: z.string(),
    image: AssetSchema.optional(),
    imagePosition: z.literal('Block').or(z.literal('Inline')).optional(),
    videoSrc: z.string().optional(),
    description: z.string().optional(),
    callToActionPrimary: LinkSchema.optional(),
    callToActionSecondary: LinkSchema.optional(),
    trailingComponent: z.array(AppStoreButtonSchema).optional(),
  }),
})

export type PrimerComponentHero = z.infer<typeof PrimerComponentHeroSchema>
