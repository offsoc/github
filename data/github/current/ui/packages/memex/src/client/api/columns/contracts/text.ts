/**
 * Where a piece of text in the data model can differ between viewing and
 * editing, the server will include both versions of the string to save the
 * application on doing this rendering ourselves.
 */
export interface EnrichedText {
  raw: string
  html: string
}
