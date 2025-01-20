import {z} from 'zod'

export const AssetSchema = z.object({
  fields: z.object({
    description: z.string().optional(),

    file: z.object({
      url: z.string(),
    }),
  }),
})

export type Asset = z.infer<typeof AssetSchema>
