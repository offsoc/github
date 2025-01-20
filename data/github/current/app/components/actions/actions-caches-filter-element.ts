import type {Suggestion} from '../../assets/modules/github/filter-input'
import {controller} from '@github/catalyst'
import {ActionsBaseFilter} from './actions-base-filter'

@controller
class ActionsCachesFilterElement extends ActionsBaseFilter {
  override fetchQualifierSuggestions(): Suggestion[] {
    return [
      {value: 'branch:', description: 'my-branch-name'},
      {value: 'key:', description: 'key-name'},
    ]
  }

  override async fetchSuggestionsForQualifier(qualifier: string): Promise<Suggestion[]> {
    switch (qualifier) {
      case 'branch':
        return this.fetchBranchSuggestions()
      default:
        return []
    }
  }
}
