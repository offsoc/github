import {featureFlag} from '@github-ui/feature-flags'

export type ContextData = {
  description: string
  value: string
  allowTruncation: boolean
}

export class Context {
  // The value of this attribute will be treated as the context value.
  readonly dataValueAttribute: string = 'data-value'
  // The value of this attribute may be the id of an input element whose value
  // should be used as the context value.
  readonly dataReferenceAttribute: string = 'data-reference'
  // Description of the context provided by either `data-value` or value
  // of an input referenced by `data-reference`. This will be used by the AI
  // to understand the meaning of the context.
  readonly dataDescriptionAttribute: string = 'data-description'
  // This context may be partially included in the prompt if including all
  // of it will push us over the prompt limit.
  readonly dataAllowTruncationAttribute: string = 'data-allow-truncation'

  public issueReferencesContext: ContextData | null = null

  contextElementIds: string[]
  elementDescription: string
  asyncContext: string = ''

  constructor(contextElementIds: string[], elementDescription: string) {
    this.contextElementIds = contextElementIds
    this.elementDescription = elementDescription
  }

  // Return all retrievable context in a priority-order array of ContextData objects.
  // Priority is just the order of the elements in the DOM.
  all(): ContextData[] {
    const result = []

    for (const id of this.contextElementIds) {
      const element = document.getElementById(id) as HTMLElement

      if (element === null) {
        continue
      }

      const value = this.getContextValueForElement(element)
      if (!value) {
        continue
      } else {
        result.push({
          value,
          allowTruncation: element.hasAttribute(this.dataAllowTruncationAttribute),
          description: this.idToContextDescription(id),
        })
      }
    }

    if (this.issueReferencesContext) {
      result.push(this.issueReferencesContext)
    }

    if (featureFlag.isFeatureEnabled('ghost_pilot_pr_autocomplete_comments')) {
      result.push(this.commentsContext())
    }

    if (featureFlag.isFeatureEnabled('ghost_pilot_vnext')) {
      // This is overriding any priority ordering in the DOM, and some of the dynamic attributes,
      // in the interest of making it easier to iterate on the vnext prompt without repeatedly
      // pinging the review teams owning the components where those DOM context bits are included.
      const recentInteractions = result.find(c => c.description === 'User Recent Interactions')
      const pullRequestTitle = result.find(c => c.description === 'Pull Request Title')
      const commitTitles = result.find(c => c.description === 'Pull Request Commit Titles')
      const diffSummary = result.find(
        c => c.description === 'Instructions for how the assistant would write an entire pull request description.',
      )

      const vnextResult = []
      if (recentInteractions) {
        recentInteractions.description = 'User recent interactions (other PRs and issues viewed)'
        vnextResult.push(recentInteractions)
      }
      if (pullRequestTitle) {
        vnextResult.push(pullRequestTitle)
      }
      if (commitTitles) {
        commitTitles.description = 'Commits in this PR'
        vnextResult.push(commitTitles)
      }
      if (diffSummary) {
        // This is tossing out a ton of the generated content including length examples and and instruction prompt.
        diffSummary.description = 'Changes in this PR'
        diffSummary.value = diffSummary.value.substring(diffSummary.value.indexOf('### Change reference'))
        vnextResult.push(diffSummary)
      }
      // TODO: Add back issue references somewhere.
      return vnextResult
    } else {
      return result
    }
  }

  private commentsContext(): ContextData {
    const commentBody = Array.from(document.querySelectorAll('.js-comment-body'))
      .map(e => e.textContent)
      .filter(e => e !== null)
    return {
      value: commentBody.join('---'),
      allowTruncation: false,
      description: 'Existing discussion separated by ---',
    } as ContextData
  }

  private getContextValueForElement(element: HTMLElement) {
    const dataValue = element.getAttribute(this.dataValueAttribute)
    const dataReference = element.getAttribute(this.dataReferenceAttribute)
    if (dataValue) {
      return dataValue
    } else if (dataReference) {
      const referencedInput = document.getElementById(dataReference) as HTMLInputElement
      if (referencedInput) {
        return referencedInput.value
      }
    } else {
      const val = (element as HTMLInputElement).value
      if (val && val.length > 0) {
        return val
      }
    }
  }

  private idToContextDescription(id: string): string {
    const element = document.getElementById(id) as HTMLInputElement
    if (element && element.getAttribute(this.dataDescriptionAttribute) != null) {
      return element.getAttribute(this.dataDescriptionAttribute) || ''
    } else {
      return `${id
        .toLowerCase()
        .split(/-|_/)
        .map(function (word) {
          return word.charAt(0).toUpperCase() + word.slice(1)
        })
        .join(' ')}`
    }
  }
}
