import {z} from 'zod'

/**
 * This schema verifies the payload received by the React application
 * has a known shape. The content inside "contentfulRawJsonResponse" should
 * be later validated by other schemas.
 */
export const PayloadSchema = z.object({
  contentfulRawJsonResponse: z.object({}).passthrough(),
  userLoggedIn: z.boolean().optional(),
})

export type Payload = z.infer<typeof PayloadSchema>

export function toPayload(payload: unknown): Payload {
  return PayloadSchema.parse(payload)
}
