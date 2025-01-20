export class ResponseCleaner {
  removeRepetition(text: string): string {
    // Remove duplicate mentions like "@greggroth @greggroth @greggroth"
    const withoutDuplicateMentions = text.replace(/(@\w+)(?:\s+\1)+/g, '$1')
    // Remove duplicate lines, which frequently occurs in lists
    const uniqueArray = [...new Set(withoutDuplicateMentions.split('\n'))]
    return uniqueArray.join('\n')
  }

  removeExcessNewlines(text: string, suffix?: string) {
    let cleanedUpText = text.replaceAll('\r\n', '\n')
    if (!suffix || suffix.startsWith('\n')) {
      // Suggestion ends the content or already precedes a newline; in either case, don't suggest further newlines.
      while (cleanedUpText.endsWith('\n')) {
        cleanedUpText = cleanedUpText.slice(0, -1)
      }
    }
    return cleanedUpText
  }

  truncateToEndOfSentence(text: string, suffix?: string, ignoreSuffix?: boolean) {
    if (ignoreSuffix || !suffix || suffix.match(/^\s+$/)) {
      // Stop at the end of the sentence unless there's any actual non-whitespace text already following it in the suffix.
      // This regexp matches anything ending in ., !, or ? followed by whitespace or the end of the string.
      const trimmedText = text.match(/(.+?[.!?])(?=$|\s+)/)
      return trimmedText === null ? text : trimmedText[0]
    } else {
      return text
    }
  }
}
