import {verifiedFetch} from '@github-ui/verified-fetch'
import type {ContextData} from './context'
import {IssueReference} from './issue-reference'
import {TextWithReferences} from './text-with-references'

export class IssueReferenceContext {
  // The references that have been found in the source
  references: IssueReference[] = []
  // Limit the number of references we try to include
  maxReferences = 5

  // TODO:
  // - Update the prompt to better connect a reference to the details provided here
  // - Are we concerned about issue content/titles changing while a user is
  //   writing a PR and the prompt including stale data?
  async context(inputText: string): Promise<ContextData | null> {
    this.references = await this.collectIssueDetails(this.getIssueReferences(inputText))

    return {
      value: this.references.map(i => this.formatIssueDescription(i)).join('\n'),
      allowTruncation: true,
      description:
        'The following is content from pages the user has referenced. A page reference looks like #123 or https://github.com/{owner}/{repo}/issues/123 and typically refers to a task or bug they are aiming to address with this pull request.',
    }
  }

  private getIssueReferences(inputText: string): IssueReference[] {
    const links = []
    for (const ref of new TextWithReferences(inputText).fixedIssues()) {
      links.push(new IssueReference(ref))
    }
    return links.slice(0, this.maxReferences)
  }

  private async collectIssueDetails(partialReferences: IssueReference[]): Promise<IssueReference[]> {
    const currentReferences: IssueReference[] = []
    const newRequests = []

    for (const ref of partialReferences) {
      const cachedReference = this.references.find(existingRef => existingRef.href === ref.href)
      if (cachedReference) {
        currentReferences.push(cachedReference)
      } else {
        newRequests.push(verifiedFetch(ref.href))
      }
    }

    const responses = await Promise.all(newRequests)
    for (const resp of responses) {
      if (resp.status !== 200) {
        continue
      }

      const issueJson = await resp.json()
      const ref = partialReferences.find(r => r.href === resp.url)
      if (ref) {
        ref.title = issueJson.title || ''
        ref.description = issueJson.body || ''
        currentReferences.push(ref)
      }
    }

    return currentReferences
  }

  private formatIssueDescription(ref: IssueReference) {
    return `# ${ref.title}\n${ref.description}\n`
  }
}
