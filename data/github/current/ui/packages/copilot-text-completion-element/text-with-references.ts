export class TextWithReferences {
  text: string

  //https://docs.github.com/en/issues/tracking-your-work-with-issues/linking-a-pull-request-to-an-issue#linking-a-pull-request-to-an-issue-using-a-keyword
  private fixedIssueKeywords = ['close', 'closes', 'closed', 'fix', 'fixes', 'fixed', 'resolve', 'resolves', 'resolved']
  private positiveReferences = ['part of', 'towards']
  private validRepoCharacters = '[a-zA-Z0-9-._]'
  private validOwnerCharacters = '[a-zA-Z0-9-._]'
  private issueReferenceRegex = [
    '#\\d+',
    `${this.validOwnerCharacters}+/${this.validRepoCharacters}+#\\d+`,
    `https://github.com/${this.validOwnerCharacters}+/${this.validRepoCharacters}+/issues/\\d+`,
  ]
  private fixedIssueReferencesRegex = new RegExp(
    `(${this.fixedIssueKeywords
      .concat(this.positiveReferences)
      .join('|')}) (?<Reference>${this.issueReferenceRegex.join('|')})`,
    'gi',
  )

  constructor(text: string) {
    this.text = text
  }

  // Get issue references
  fixedIssues(): string[] {
    const references: string[] = []

    // Remove code blocks
    this.text = this.text.replace(/```[\s\S]*?```/g, '')
    this.text = this.text.replace(/`[\s\S]*?`/g, '')

    for (const match of this.text.matchAll(this.fixedIssueReferencesRegex)) {
      if (match.groups?.Reference) {
        references.push(match.groups.Reference)
      }
    }
    return references
  }
}
