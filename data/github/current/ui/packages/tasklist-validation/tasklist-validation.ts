// Regex patterns for parsing tasklist content
const titlePatternParser = '#{1,6}\\s+.*' // # Title (h1-h6 accepted)
// Translated to JavaScript from patterns defined in lib/task_list/filter.rb
const incompletePattern = '\\[[\\s]\\]'
const completePattern = '\\[[xX]\\]'
const itemPattern = `\\s*(${completePattern}|${incompletePattern})(?=\\s)` // [ ] or [x]
const itemPrefixPattern = '^(?:\\s*[-+*]|(?:\\s*\\d+\\.))' // - or + or * or 1. etc
const issueTextPattern = '\\s*(.*?)\\s*$'
// A valid item, e.g. "- [ ] item"
const trackedIssuePatternParser = `${itemPrefixPattern}${itemPattern}${issueTextPattern}`

export function hasCustomTitle(content: string) {
  const titleRegex = new RegExp(titlePatternParser)
  return titleRegex.test(content)
}

export function validateContent(content: string) {
  const itemRegex = new RegExp(trackedIssuePatternParser)
  const lines = content.split('\n')
  const validatedLines = lines
    .map(line => line.trim())
    .map(line => {
      // Ignore custom title if found
      if (hasCustomTitle(line)) {
        return line
      }
      // Already matches correct format
      if (itemRegex.test(line)) {
        return line
      }

      const hasPrefix = new RegExp(itemPrefixPattern).test(line)
      const hasItem = new RegExp(itemPattern).test(line)
      const hasIssueText = line && new RegExp(issueTextPattern).test(line)

      // Item we can't fix:
      // Empty line or something we can't parse
      if (!hasPrefix && !hasItem && !hasIssueText) {
        return line
      }
      // Item with no text, or just a prefix, or just an item (brackets)
      if (!hasIssueText) {
        return line
      }

      // Item we can fix
      let validLine = line
      if (!hasPrefix) {
        validLine = `- ${line}`
      }
      if (!hasItem) {
        validLine = `${validLine.slice(0, 2)}[ ] ${validLine.slice(2)}`
      }

      return validLine
    })
  return validatedLines.join('\n')
}
