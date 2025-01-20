import type {Suggestion} from '../../assets/modules/github/filter-input'
import {BaseFilterElement} from '../../assets/modules/github/filter-input'
import {target} from '@github/catalyst'
import {debounce} from '@github/mini-throttle/decorators'

export abstract class ActionsBaseFilter extends BaseFilterElement {
  @target filterKeywordWarningContainer: HTMLElement
  @target filterKeywordWarningMessage: HTMLElement

  override showAllQualifiersIfNoneMatch = false
  override fuzzyMatchQualifiers = true
  override showSubmissionOptionIfInvalidSearchTerms = true
  override suggestionsTitle = 'Narrow your search'

  // No space between the value and description because they are
  // a qualifier:value pair, and qualifiers and values don't have
  // a space between them.
  override spaceBetweenValueAndDescription = false

  override renderSearchWarningIfRequired() {
    // Search warnings are displayed differently in the actions search
    // so just return empty string here.
    return ''
  }

  override postDropdownRender() {
    this.updateKeywordWarning()
  }

  override invalidSearchTerms() {
    return this.getFilterInputStringWithoutQualifiers()
  }

  // Gets the current filter input with any qualifiers (qualifier:value) removed.
  getFilterInputStringWithoutQualifiers(): string {
    return this.searchInput.value.replace(/\S+:("[^"]+"?|\S)*/g, '').trim()
  }

  updateKeywordWarning() {
    // Remove any qualifiers from filter string, if there is any free text input, show a warning that it won't
    // affect the filter result
    if (this.getFilterInputStringWithoutQualifiers().length === 0) {
      this.hideKeywordWarning()
    } else {
      this.showKeywordWarning()
    }
  }

  // We want to hide the warning immediately, but only show them once the user stops typing, so debounce
  // the show method.
  hideKeywordWarning() {
    this.filterKeywordWarningContainer.hidden = true
  }

  @debounce(300)
  showKeywordWarning() {
    if (this.getFilterInputStringWithoutQualifiers().length > 0) {
      this.filterKeywordWarningMessage.textContent = this.getFilterInputStringWithoutQualifiers()
      this.filterKeywordWarningContainer.hidden = false
    }
  }

  async fetchBranchSuggestions(): Promise<Suggestion[]> {
    const url = this.searchInput.getAttribute('data-suggested-branches-path')!
    const branches = await this.cachedJSON<{refs: string[]}>(url)
    return branches.refs.map(branch => ({value: branch}))
  }
}
