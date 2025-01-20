import {fuzzyScore} from '@github-ui/fuzzy-score/fuzzy-score'
import {hasMatch} from 'fzy.js'
import type {Disposable, Environment} from 'react-relay'
import {fetchQuery, graphql} from 'react-relay'
import {createOperationDescriptor, getRequest} from 'relay-runtime'

import {FILTER_KEYS, FILTER_VALUES} from '../constants/filter-constants'
import type {FilterQuery} from '../filter-query'
import {
  type AnyBlock,
  type ARIAFilterSuggestion,
  type FilterConfig,
  type FilterProvider,
  FilterProviderType,
  type FilterValueData,
  FilterValueType,
  type IndexedBlockValueItem,
  type MutableFilterBlock,
  type SuppliedFilterProviderOptions,
  type ValueRowProps,
} from '../types'
import {
  caseInsensitiveStringCompare,
  escapeString,
  getFilterValue,
  getLastFilterBlockValue,
  getUnescapedFilterValue,
} from '../utils'
import {ValueIcon} from '../utils/ValueIcon'
import {AsyncFilterProvider} from '.'
import type {typeFilterIssueTypeQuery} from './__generated__/typeFilterIssueTypeQuery.graphql'
import type {typeFilterProjectIssueTypeQuery} from './__generated__/typeFilterProjectIssueTypeQuery.graphql'
import type {typeFilterViewerIssueTypeQuery} from './__generated__/typeFilterViewerIssueTypeQuery.graphql'

const RepoIssueTypesQuery = graphql`
  query typeFilterIssueTypeQuery($name: String!, $owner: String!) {
    repository(name: $name, owner: $owner) {
      issueTypes(first: 10) {
        edges {
          node {
            name
          }
        }
      }
    }
  }
`

const ViewerIssueTypesQuery = graphql`
  query typeFilterViewerIssueTypeQuery {
    viewer {
      suggestedIssueTypeNames
    }
  }
`

const ProjectIssueTypesQuery = graphql`
  query typeFilterProjectIssueTypeQuery($login: String!, $number: Int!) {
    organization(login: $login) {
      projectV2(number: $number) {
        suggestedIssueTypeNames
      }
    }
  }
`

type IssueType = {
  name: string
}

type RepositoryRequestVariables = {
  name: string
  owner: string
}

type ProjectRequestVariables = {
  login: string
  number: number
}

type ProjectScope = {
  login?: string
  projectNumber?: number
}

type RequestVariables = RepositoryRequestVariables | ProjectRequestVariables

export class TypeFilterProvider extends AsyncFilterProvider<IssueType> implements FilterProvider {
  filterValues?: ARIAFilterSuggestion[]
  relayEnvironment?: Environment
  repositoryScope?: string
  projectScope?: ProjectScope
  issueTypesEnabled?: boolean
  owner?: string
  repo?: string
  legacy: boolean
  requestVariables?: RequestVariables
  requestDisposable?: Disposable

  constructor(
    options?: SuppliedFilterProviderOptions,
    legacy: boolean = false,
    relayEnvironment?: Environment,
    repositoryScope?: string,
    issueTypesEnabled: boolean = false,
    projectScope?: ProjectScope,
  ) {
    super(FILTER_KEYS.type, {...options, filterTypes: {...options?.filterTypes, multiValue: true}})
    this.type = FilterProviderType.Text
    this.relayEnvironment = relayEnvironment
    this.repositoryScope = repositoryScope
    this.projectScope = projectScope
    this.issueTypesEnabled = issueTypesEnabled
    this.requestVariables = this.getRequestVariables()
    this.requestDisposable = this.getRequestDisposable()
    this.legacy = legacy
  }

  async getSuggestions(
    filterQuery: FilterQuery,
    filterBlock: AnyBlock | MutableFilterBlock,
    config: FilterConfig,
    caretIndex?: number | null,
  ) {
    const lastValue = getLastFilterBlockValue(filterBlock, caretIndex)
    const suggestions =
      (await this.processSuggestions(filterQuery, filterBlock, this.processSuggestion.bind(this), caretIndex)) || []
    const rankedSuggestions = []

    for (const suggestion of suggestions) {
      const {value: fValue, displayName} = suggestion
      const value = getFilterValue(fValue)

      const matchesValue = !!value && hasMatch(lastValue, value)
      const matchesDisplayName = !!displayName && hasMatch(lastValue, displayName)

      if (!value || (!matchesValue && !matchesDisplayName)) continue

      suggestion.priority -= fuzzyScore(lastValue, value)

      rankedSuggestions.push(suggestion)
    }

    return rankedSuggestions
  }

  override async fetchSuggestions(value: string, block: AnyBlock | MutableFilterBlock): Promise<IssueType[] | null> {
    if (!block) return []

    try {
      if (this.relayEnvironment && !!this.requestVariables && this.repositoryScope && this.issueTypesEnabled) {
        const repoIssueTypes = await fetchQuery<typeFilterIssueTypeQuery>(
          this.relayEnvironment,
          RepoIssueTypesQuery,
          this.requestVariables as RepositoryRequestVariables,
          {fetchPolicy: 'store-or-network'},
        ).toPromise()

        const edges = repoIssueTypes?.repository?.issueTypes?.edges || []
        const issueTypes = []
        for (const edge of edges) {
          if (edge && edge.node && edge.node.name) {
            issueTypes.push({name: edge.node.name})
          }
        }
        return issueTypes
      }
      // for memex we fetch the issue types from the memex_owner
      else if (this.relayEnvironment && this.projectScope && this.issueTypesEnabled) {
        const projectIssueTypes = await fetchQuery<typeFilterProjectIssueTypeQuery>(
          this.relayEnvironment,
          ProjectIssueTypesQuery,
          this.requestVariables as ProjectRequestVariables,
          {fetchPolicy: 'store-or-network'},
        ).toPromise()

        const issueTypes = projectIssueTypes?.organization?.projectV2?.suggestedIssueTypeNames || []
        return issueTypes?.map((item: string) => ({name: item})) as IssueType[]
      }

      // for /issues dashboard we need to fetch issue types from all orgs that the viewer is member of
      else if (this.relayEnvironment && !this.projectScope && !this.repositoryScope) {
        const viewerIssueTypes = await fetchQuery<typeFilterViewerIssueTypeQuery>(
          this.relayEnvironment,
          ViewerIssueTypesQuery,
          {},
          {fetchPolicy: 'store-or-network'},
        ).toPromise()

        const issueTypes = viewerIssueTypes?.viewer?.suggestedIssueTypeNames || []
        return issueTypes?.map((item: string) => ({name: item})) as IssueType[]
      }
    } catch {
      return []
    }

    return []
  }

  override async validateFilterValue(value: string): Promise<IssueType | null> {
    try {
      if (this.relayEnvironment && !!this.requestVariables && this.repositoryScope && this.issueTypesEnabled) {
        const repoIssueTypes = await fetchQuery<typeFilterIssueTypeQuery>(
          this.relayEnvironment,
          RepoIssueTypesQuery,
          this.requestVariables as RepositoryRequestVariables,
          {fetchPolicy: 'store-or-network'},
        ).toPromise()

        const edges = repoIssueTypes?.repository?.issueTypes?.edges || []
        const issueTypes = []
        for (const edge of edges) {
          if (edge && edge.node && edge.node.name) {
            issueTypes.push({name: edge.node.name})
          }
        }
        return issueTypes.find(i => caseInsensitiveStringCompare(i.name, value)) as IssueType
      } else if (this.relayEnvironment && !!this.requestVariables && this.projectScope && this.issueTypesEnabled) {
        const projectIssueTypes = await fetchQuery<typeFilterProjectIssueTypeQuery>(
          this.relayEnvironment,
          ProjectIssueTypesQuery,
          this.requestVariables as ProjectRequestVariables,
          {fetchPolicy: 'store-or-network'},
        ).toPromise()

        const issueTypes = projectIssueTypes?.organization?.projectV2?.suggestedIssueTypeNames || []
        return {name: issueTypes?.find(item => caseInsensitiveStringCompare(item, value))} as IssueType
      } else if (this.relayEnvironment) {
        const viewerIssueTypes = await fetchQuery<typeFilterViewerIssueTypeQuery>(
          this.relayEnvironment,
          ViewerIssueTypesQuery,
          {},
          {fetchPolicy: 'store-or-network'},
        ).toPromise()

        const issueTypes = viewerIssueTypes?.viewer?.suggestedIssueTypeNames || []
        return {name: issueTypes?.find(item => caseInsensitiveStringCompare(item, value))} as IssueType
      }
    } catch {
      return null
    }
    return null
  }

  override validateValue(
    filterQuery: FilterQuery,
    value: IndexedBlockValueItem,
    issueType: IssueType | null,
  ): false | Partial<IndexedBlockValueItem> | null | undefined {
    const extractedValue = getUnescapedFilterValue(value.value)
    const validValues = this.legacy
      ? [...FILTER_VALUES.type.map(({value: typeValue}) => typeValue as string), issueType?.name]
      : [issueType?.name]
    if (validValues.length === 0 || !extractedValue) return false

    const matchedName = validValues.find(name => caseInsensitiveStringCompare(name, extractedValue))
    if (!matchedName) return false

    return {
      value: escapeString(extractedValue) ?? '',
      displayName: extractedValue,
    }
  }

  override async processSuggestions(
    filterQuery: FilterQuery,
    filterBlock: AnyBlock | MutableFilterBlock,
    processSuggestion: (item: IssueType, query: string, filterQuery: FilterQuery) => ARIAFilterSuggestion,
    caretIndex?: number | null,
  ) {
    if (!this.shouldGetSuggestions(filterBlock)) return null

    const lastValue = getLastFilterBlockValue(filterBlock, caretIndex)
    const items = (await this.fetchSuggestions(lastValue, filterBlock)) ?? []
    const suggestions: ARIAFilterSuggestion[] = this.legacy
      ? FILTER_VALUES.type.map(fv => ({...fv, ariaLabel: `${fv.displayName}, ${this.displayName}`}))
      : []

    return [...suggestions, ...items.map(item => processSuggestion(item, lastValue, filterQuery))]
  }

  getValueRowProps(value: FilterValueData): ValueRowProps {
    return {
      text: value.displayName ?? getFilterValue(value.value) ?? '',
      leadingVisual: ValueIcon({value, providerIcon: this.icon}),
    }
  }

  private processSuggestion(issueType: IssueType, query: string): ARIAFilterSuggestion {
    const {name} = issueType
    let priority = 3

    if (query) {
      if (name) priority -= fuzzyScore(query, name)
    }

    return {
      type: FilterValueType.Value,
      displayName: name,
      ariaLabel: `${name}, ${this.displayName}`,
      value: escapeString(name) ?? '',
      inlineDescription: true,
      priority,
      icon: this.icon,
    }
  }

  private getRequestVariables(): RequestVariables | undefined {
    if (this.repositoryScope) {
      const repoParts = this.repositoryScope.split('/')

      return {
        owner: repoParts[0] || '',
        name: repoParts[1] || '',
      }
    } else if (this.projectScope?.login && this.projectScope?.projectNumber) {
      return {
        login: this.projectScope.login,
        number: this.projectScope.projectNumber,
      }
    } else {
      return undefined
    }
  }

  private getRequestDisposable(): Disposable | undefined {
    if (!this.relayEnvironment) {
      return undefined
    }

    if (this.requestVariables && this.repositoryScope) {
      const request = getRequest(RepoIssueTypesQuery)
      const operation = createOperationDescriptor(request, this.requestVariables)
      return this.relayEnvironment.retain(operation)
    } else if (this.requestVariables && this.projectScope) {
      const request = getRequest(ProjectIssueTypesQuery)
      const operation = createOperationDescriptor(request, this.requestVariables)
      return this.relayEnvironment.retain(operation)
    } else {
      const request = getRequest(ViewerIssueTypesQuery)
      const operation = createOperationDescriptor(request, {})
      return this.relayEnvironment.retain(operation)
    }
  }
}
