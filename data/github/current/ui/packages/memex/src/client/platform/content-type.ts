export const ContentType = {
  JSON: 'application/json',
  FormData: 'application/x-www-form-urlencoded',
  CSV: 'text/csv',
  HTML: 'text/html',
  Text: 'text/plain',
} as const
export type ContentType = ObjectValues<typeof ContentType>
