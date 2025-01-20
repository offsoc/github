import type {Suggestion} from '../../assets/modules/github/filter-input'
import {controller} from '@github/catalyst'
import {ActionsBaseFilter} from './actions-base-filter'

@controller
class ActionsWorkflowFilterElement extends ActionsBaseFilter {
  override fetchQualifierSuggestions(): Suggestion[] {
    const suggestions: Suggestion[] = [
      {value: 'actor:', description: 'octocat'},
      {value: 'branch:', description: 'my-branch-name'},
      {value: 'event:', description: 'push, pull_request, schedule, check_run, check_suite, etc.'},
      {value: 'is:', description: 'success, failure, in_progress, neutral, etc.'},
    ]

    if (this.searchInput.getAttribute('data-use-workflow-qualifier') === 'true') {
      suggestions.push({value: 'workflow:', description: 'workflow-name'})
    }

    return suggestions
  }

  override async fetchSuggestionsForQualifier(qualifier: string): Promise<Suggestion[]> {
    switch (qualifier) {
      case 'branch':
        return this.fetchBranchSuggestions()
      case 'actor':
        return this.fetchActorSuggestions()
      case 'event':
        return this.fetchEventSuggestions()
      case 'is':
        return this.fetchStatusSuggestions()
      case 'workflow':
        if (this.searchInput.getAttribute('data-use-workflow-qualifier') === 'true') {
          return this.fetchWorkflowSuggestions()
        }
        return []
      default:
        return []
    }
  }

  async fetchActorSuggestions(): Promise<Suggestion[]> {
    const url = this.searchInput.getAttribute('data-suggested-actors-path')!
    const actors = await this.cachedJSON<ActorData[]>(url)
    return actors.map(actor => ({value: actor.login, description: actor.displayName}))
  }

  async fetchEventSuggestions(): Promise<Suggestion[]> {
    const url = this.searchInput.getAttribute('data-suggested-events-path')!
    const events = await this.cachedJSON<string[]>(url)
    return events.map(event => ({value: event}))
  }

  async fetchStatusSuggestions(): Promise<Suggestion[]> {
    const url = this.searchInput.getAttribute('data-suggested-statuses-path')!
    const statuses = await this.cachedJSON<string[]>(url)
    return statuses.map(status => ({value: status}))
  }

  async fetchWorkflowSuggestions(): Promise<Suggestion[]> {
    const url = this.searchInput.getAttribute('data-suggested-workflows-path')!
    const workflows = await this.cachedJSON<string[]>(url)
    return workflows.map(workflow => ({value: workflow}))
  }
}

type ActorData = {
  login: string
  displayName: string
}
