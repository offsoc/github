export function generateSuggestedBranchName(title: string, number: number) {
  let cleanTitle = title.replaceAll(/\s+/g, '-')
  cleanTitle = cleanTitle.replaceAll(/[^a-zA-Z0-9_-]/gu, '')

  const suggestion = `${number}-${cleanTitle}`.toLowerCase()

  return suggestion
}
