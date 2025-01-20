export function joinWords(words: string[]): string {
  if (words.length < 2) {
    return words[0] || ''
  }

  switch (words.length) {
    case 2:
      return `${words[0]} and ${words[1]}`
    default:
      return `${words.slice(0, -1).join(', ')}, and ${words[words.length - 1]}`
  }
}
