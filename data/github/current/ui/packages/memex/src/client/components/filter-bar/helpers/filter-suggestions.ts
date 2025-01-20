export const ShowColumnSuggestionModeEnum = {
  None: 'none',
  ColumnOnly: 'column-only',
  ColumnAndValues: 'column-and-values',
} as const

export type ShowColumnSuggestionModeEnum = ObjectValues<typeof ShowColumnSuggestionModeEnum>

export const isUpdatedQualifier = (keyword: string) => {
  return keyword === 'last-updated' || keyword === 'updated'
}

export const isIssueTypeQualifier = (keyword: string) => {
  return keyword === 'type'
}
