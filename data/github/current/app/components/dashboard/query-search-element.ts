import {html, render} from 'lit-html'
import {controller} from '@github/catalyst'
import {eventToHotkeyString} from '@github-ui/hotkey'
import {until} from 'lit-html/directives/until'
import {BaseFilterElement} from '../../assets/modules/github/filter-input'

interface Suggestion {
  value: string
  description?: string
}

const textQualifiers: Suggestion[] = [
  {
    description: 'filter by text in title',
    value: 'in:title',
  },
  {
    description: 'filter by text in body',
    value: 'in:body',
  },
  {
    description: 'filter by text in comments',
    value: 'in:comments',
  },
]

@controller
class QuerySearchElement extends BaseFilterElement {
  // Render autocomplete suggestions to match qualifier names from the currently typed text
  // If no matches, render all suggestions as well as text qualifier suggestions
  override renderMatchingOrAllQualifierSuggestions(filterString: string): void {
    const suggestions = this.fetchQualifierSuggestions()
    const matchingSuggestions = this.filterSuggestionsList(suggestions, filterString, {
      fuzzy: this.fuzzyMatchQualifiers,
    })
      /* eslint-disable-next-line github/no-then */
      .then(matching => {
        const textMatchers: Suggestion[] = filterString
          ? textQualifiers.map(q => ({
              value: `"${filterString}" ${q.value}`,
              description: q.description,
            }))
          : []
        const ret = matching.length === 0 ? suggestions.slice() : matching.slice()
        ret.unshift(...textMatchers)
        return ret
      })

    this.renderSuggestionDropdown(matchingSuggestions)
  }

  // Render a promise of suggestions into the dropdown
  // If the suggestions haven't finished loading,  "loading..." will be rendered until they do
  override renderSuggestionDropdown(suggestionsPromise: Promise<Suggestion[]>): void {
    render(
      html` <div>${until(this.renderSuggestionList(suggestionsPromise), this.renderLoadingItem())}</div>`,
      this.autocompleteResults,
    )

    this.postDropdownRender()
  }

  handleSubmitEvent(e: Event) {
    e.preventDefault()
    return false
  }

  override handleFormKeydownEvent(event: CustomEvent) {
    if (event.detail.hotkey === 'Enter') {
      // Don't submit if only has "loading..."
      if (this.autocompleteResults.querySelector('.js-filter-loading')) {
        return
      }

      // Update the input value if user selects a suggestion
      if (this.autocompleteResults.querySelector('.js-navigation-item.navigation-focus')) {
        this.handleSelectedSuggestionResultEvent(event)
      }

      this.handleSubmitEvent(event)
    }
  }

  // we override this listener to handle the case where a user wants to exit out of the autocomplete but not the modal that it is in.
  override inputKey(event: KeyboardEvent) {
    const autocomplete = this.autocompleteDropdown
    if (eventToHotkeyString(event) === 'Escape' && !autocomplete.hidden) {
      event.preventDefault()
      // prevent event from reaching modal-dialog
      event.stopPropagation()
      // hide autocomplete
      this.hideFilterSuggestions()
    }
  }

  override clear() {
    this.searchInput.value = this.getDefaultSearch()

    this.searchInput.dispatchEvent(
      new Event('input', {
        bubbles: true,
      }),
    )
  }
}
