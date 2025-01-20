/**
 * Matches the query against the text fields of an item.
 */
export function matchesQuery(query: string, textField1: string, textField2?: string | null | undefined) {
  if (!query.trim()) return true

  const normalizedQuery = query.trim().toLowerCase()

  if (textField1.toLowerCase().includes(normalizedQuery)) return true
  if (textField2?.toLowerCase().includes(normalizedQuery)) return true
  return false
}
