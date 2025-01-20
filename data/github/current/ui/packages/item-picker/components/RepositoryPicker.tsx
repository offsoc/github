/* eslint-disable relay/must-colocate-fragment-spreads */
/* eslint eslint-comments/no-use: off */
/* eslint-disable relay/unused-fields */
import {useDebounce} from '@github-ui/use-debounce'
// eslint-disable-next-line no-restricted-imports
import {useToastContext} from '@github-ui/toast/ToastContext'
import {LockIcon, RepoIcon, TriangleDownIcon} from '@primer/octicons-react'
import {Box, Button} from '@primer/react'
import {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import {
  fetchQuery,
  graphql,
  type PreloadedQuery,
  readInlineData,
  usePreloadedQuery,
  useRelayEnvironment,
  useFragment,
  type Environment,
} from 'react-relay'

import {ERRORS} from '../constants/errors'
import {LABELS} from '../constants/labels'
import type {
  RepositoryPickerRepository$data,
  RepositoryPickerRepository$key,
} from './__generated__/RepositoryPickerRepository.graphql'
import type {
  RepositoryPickerSearchRepositoriesQuery,
  RepositoryPickerSearchRepositoriesQuery$data,
} from './__generated__/RepositoryPickerSearchRepositoriesQuery.graphql'
import type {RepositoryPickerTopRepositoriesQuery} from './__generated__/RepositoryPickerTopRepositoriesQuery.graphql'
import {type ExtendedItemProps, ItemPicker} from './ItemPicker'
import {getRepositorySearchQuery} from '../shared'
import type {RepositoryPickerTopRepositories$key} from './__generated__/RepositoryPickerTopRepositories.graphql'
import type {RepositoryPickerCurrentRepoQuery} from './__generated__/RepositoryPickerCurrentRepoQuery.graphql'
import {VALUES} from '../constants/values'

export type Repository = RepositoryPickerRepository$data

type RepositoryPickerBaseProps = {
  initialRepository: Repository | undefined
  onSelect: (repo: Repository | undefined) => void
  preventDefault?: boolean
  organization?: string
  focusRepositoryPicker?: boolean
  enforceAtleastOneSelected?: boolean
  options?: {hasIssuesEnabled?: boolean; readonly?: boolean}
  renderTrailingVisual?: (repoId: string) => JSX.Element | undefined
  exclude?: string
  'aria-labelledby'?: string
  'aria-describedby'?: string
  anchorElement?: (props: React.HTMLAttributes<HTMLElement>) => JSX.Element
  title?: string
  subtitle?: string | React.ReactElement
  preventClose?: boolean
  triggerOpen?: boolean
  onOpen?: () => void
  onClose?: () => void
  ignoredRepositories?: string[]
  repositoryFilter?: (repo: Repository) => boolean
  customNoResultsItem?: JSX.Element
  repoNameOnly?: boolean
}

export type RepositoryPickerProps = RepositoryPickerBaseProps & {
  topReposQueryRef: PreloadedQuery<RepositoryPickerTopRepositoriesQuery>
}

type RepositoryPickerInternalProps = RepositoryPickerBaseProps & {
  topRepositoriesData: RepositoryPickerTopRepositories$key | null
}

export const CurrentRepository = graphql`
  query RepositoryPickerCurrentRepoQuery($owner: String!, $name: String!, $includeTemplates: Boolean = false) {
    repository(owner: $owner, name: $name) {
      ...RepositoryPickerRepository
      ...RepositoryPickerRepositoryIssueTemplates @include(if: $includeTemplates)
    }
  }
`

export const prefetchCurrentRepository = (
  environment: Environment,
  owner = '',
  name = '',
  includeTemplates = false,
) => {
  return fetchQuery<RepositoryPickerCurrentRepoQuery>(
    environment,
    CurrentRepository,
    {
      owner,
      name,
      includeTemplates,
    },
    {fetchPolicy: 'store-or-network'},
  )
}

export const TopRepositories = graphql`
  query RepositoryPickerTopRepositoriesQuery(
    $topRepositoriesFirst: Int = 10
    $hasIssuesEnabled: Boolean
    $owner: String = null
  ) {
    viewer {
      ...RepositoryPickerTopRepositories
        @arguments(topRepositoriesFirst: $topRepositoriesFirst, hasIssuesEnabled: $hasIssuesEnabled, owner: $owner)
    }
  }
`

export const TopRepositoriesFragment = graphql`
  fragment RepositoryPickerTopRepositories on User
  @argumentDefinitions(
    topRepositoriesFirst: {type: "Int", defaultValue: 10}
    hasIssuesEnabled: {type: "Boolean", defaultValue: true}
    owner: {type: "String", defaultValue: null}
  ) {
    topRepositories(
      first: $topRepositoriesFirst
      hasIssuesEnabled: $hasIssuesEnabled
      orderBy: {field: UPDATED_AT, direction: DESC}
      owner: $owner
    ) {
      edges {
        node {
          ...RepositoryPickerRepository
        }
      }
    }
  }
`

export const prefetchTopRepositories = (
  environment: Environment,
  first = 10,
  hasIssuesEnabled: boolean | undefined = undefined,
) => {
  return fetchQuery<RepositoryPickerTopRepositoriesQuery>(
    environment,
    TopRepositories,
    {
      topRepositoriesFirst: first,
      hasIssuesEnabled,
    },
    {fetchPolicy: 'store-or-network'},
  )
}

export const SearchRepositories = graphql`
  query RepositoryPickerSearchRepositoriesQuery($searchQuery: String!, $after: String) {
    search(query: $searchQuery, type: REPOSITORY, first: 10, after: $after) {
      repositoryCount
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        ... on Repository {
          ...RepositoryPickerRepository
        }
      }
    }
  }
`

export const RepositoryFragment = graphql`
  fragment RepositoryPickerRepository on Repository @inline {
    id
    databaseId
    name
    nameWithOwner
    owner {
      databaseId
      login
      avatarUrl(size: 64)
    }
    isPrivate
    isArchived
    isInOrganization
    hasIssuesEnabled
    slashCommandsEnabled
    viewerCanPush
    viewerIssueCreationPermissions {
      labelable
      milestoneable
      assignable
      triageable
      typeable
    }
    securityPolicyUrl
    contributingFileUrl
    codeOfConductFileUrl
    shortDescriptionHTML
    planFeatures {
      maximumAssignees
    }
  }
`

export const RepositoryIssueTemplatesFragment = graphql`
  fragment RepositoryPickerRepositoryIssueTemplates on Repository @inline {
    isSecurityPolicyEnabled
    securityPolicyUrl
    isBlankIssuesEnabled
    templateTreeUrl
    # At some point we should consider only loading the template body after a template was selected
    issueTemplates {
      __id
      __typename
      about
      name
      filename
      body
      title
      labels(first: 20, orderBy: {field: NAME, direction: ASC}) {
        edges {
          node {
            ...LabelPickerLabel
          }
        }
        totalCount
      }
      assignees(first: 10) {
        edges {
          node {
            ...AssigneePickerAssignee
          }
        }
        totalCount
      }
      type {
        ...IssueTypePickerIssueType
      }
    }
    issueForms {
      __id
      __typename
      name
      description
      filename
      title
      # eslint-disable-next-line relay/must-colocate-fragment-spreads
      ...IssueFormElements_templateElements
      labels(first: 20, orderBy: {field: NAME, direction: ASC}) {
        edges {
          node {
            # eslint-disable-next-line relay/must-colocate-fragment-spreads
            ...LabelPickerLabel
          }
        }
        totalCount
      }
      assignees(first: 10) {
        edges {
          node {
            # eslint-disable-next-line relay/must-colocate-fragment-spreads
            ...AssigneePickerAssignee
          }
        }
        totalCount
      }
      projects(first: 20) {
        edges {
          node {
            ...ProjectPickerProject
          }
        }
      }
      type {
        ...IssueTypePickerIssueType
      }
    }
    contactLinks {
      __id
      name
      about
      url
      __typename
    }
  }
`

export const RepositoryPickerPlaceholder = () => (
  <Button leadingVisual={RepoIcon} trailingVisual={TriangleDownIcon} disabled>
    {LABELS.selectRepository}
  </Button>
)

export function RepositoryPicker({topReposQueryRef, ...rest}: RepositoryPickerProps) {
  const preloadedData = usePreloadedQuery<RepositoryPickerTopRepositoriesQuery>(TopRepositories, topReposQueryRef)
  return preloadedData.viewer ? <RepositoryPickerInternal {...rest} topRepositoriesData={preloadedData.viewer} /> : null
}

export function RepositoryPickerInternal({
  initialRepository,
  onSelect,
  preventDefault,
  organization,
  topRepositoriesData,
  focusRepositoryPicker,
  enforceAtleastOneSelected,
  options: {hasIssuesEnabled, readonly} = {hasIssuesEnabled: undefined, readonly: false},
  renderTrailingVisual,
  exclude,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
  anchorElement,
  title,
  subtitle,
  preventClose,
  triggerOpen,
  onOpen,
  onClose,
  ignoredRepositories,
  repositoryFilter,
  customNoResultsItem,
  repoNameOnly,
}: RepositoryPickerInternalProps) {
  const {addToast} = useToastContext()
  const [filter, setFilter] = useState('')
  const [searchResults, setSearchResults] = useState<Repository[] | undefined>(undefined)
  const [searchLoading, setSearchLoading] = useState<boolean>(topRepositoriesData == null)

  // Clear loading after initial data preloaded
  useEffect(() => {
    if (topRepositoriesData != null) {
      setSearchLoading(false)
    }
  }, [topRepositoriesData])

  const [knownOrgs, setKnownOrgs] = useState<string[]>([])
  const relayEnvironment = useRelayEnvironment()

  const fetchSearchData = useCallback(
    (searchQuery: string, orgs: string[]) => {
      // run query on search
      setSearchLoading(true)
      fetchQuery<RepositoryPickerSearchRepositoriesQuery>(relayEnvironment, SearchRepositories, {
        searchQuery: getRepositorySearchQuery(searchQuery, organization, exclude),
      }).subscribe({
        next: (data: RepositoryPickerSearchRepositoriesQuery$data) => {
          if (data !== null) {
            let fetchedRepos = (data.search.nodes || []).flatMap(node =>
              // eslint-disable-next-line no-restricted-syntax
              node ? [readInlineData<RepositoryPickerRepository$key>(RepositoryFragment, node)] : [],
            )

            if (hasIssuesEnabled) {
              fetchedRepos = fetchedRepos.filter(repo => repo.hasIssuesEnabled === hasIssuesEnabled)
            }

            let sortedNextSearchResults = fetchedRepos.sort((a, b) => {
              if (orgs.includes(a.owner.login) && !orgs.includes(b.owner.login)) {
                return -1
              } else if (!orgs.includes(a.owner.login) && orgs.includes(b.owner.login)) {
                return 1
              } else {
                return a.owner.login.localeCompare(b.owner.login)
              }
            })

            if (ignoredRepositories) {
              const ignoredSet = new Set(ignoredRepositories)
              sortedNextSearchResults = sortedNextSearchResults.filter(repo => !ignoredSet.has(repo.nameWithOwner))
            }
            if (repositoryFilter) {
              sortedNextSearchResults = sortedNextSearchResults.filter(repositoryFilter)
            }

            setSearchResults(sortedNextSearchResults)
            setSearchLoading(false)
          }
        },
        error: () => {
          setSearchLoading(false)
          // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
          addToast({
            type: 'error',
            message: ERRORS.couldNotSearchRepositories,
          })
        },
      })
    },
    [relayEnvironment, organization, exclude, hasIssuesEnabled, ignoredRepositories, repositoryFilter, addToast],
  )

  const debounceFetchSearchData = useDebounce(
    (nextValue: string) => fetchSearchData(nextValue, knownOrgs),
    VALUES.pickerDebounceTime,
  )

  useEffect(() => {
    if (filter.length === 0) {
      setSearchResults(undefined)
      return
    }
    debounceFetchSearchData(filter)
  }, [debounceFetchSearchData, filter])

  const getItemKey = useCallback((o: Repository) => o.id, [])

  const repositoryPickerRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    focusRepositoryPicker && repositoryPickerRef.current?.focus()
  }, [repositoryPickerRef, focusRepositoryPicker])

  const renderAnchor = useCallback(
    ({...anchorProps}: React.HTMLAttributes<HTMLElement>) => {
      if (anchorElement) {
        return anchorElement(anchorProps)
      }

      return (
        <Button
          leadingVisual={RepoIcon}
          trailingVisual={TriangleDownIcon}
          aria-label={!ariaLabelledBy ? LABELS.selectRepository : undefined}
          aria-labelledby={ariaLabelledBy}
          aria-describedby={ariaDescribedBy}
          {...anchorProps}
          disabled={readonly}
          ref={repositoryPickerRef}
        >
          {initialRepository ? (
            <span>
              {repoNameOnly ? initialRepository.name : `${initialRepository.owner.login}/${initialRepository.name}`}
            </span>
          ) : (
            LABELS.selectRepository
          )}
        </Button>
      )
    },
    [anchorElement, ariaDescribedBy, ariaLabelledBy, initialRepository, readonly, repoNameOnly],
  )

  const convertToItemProps = useCallback(
    (repo: Repository): ExtendedItemProps<Repository> => ({
      // this is a hack to make sure that we are using the prop
      id: `${repo.id}_${repo.databaseId}_${repo.slashCommandsEnabled}`,
      children: <span>{repoNameOnly ? repo.name : `${repo.owner.login}/${repo.name}`}</span>,
      source: repo,
      leadingVisual: () => (repo.isPrivate ? <LockIcon size={12} /> : <RepoIcon size={12} />),
      trailingVisual: renderTrailingVisual?.(repo.id),
      sx: {wordBreak: 'break-word'},
    }),
    [renderTrailingVisual, repoNameOnly],
  )

  const data = useFragment(TopRepositoriesFragment, topRepositoriesData)

  const fetchedRepos = useMemo(() => {
    let nodes = (data?.topRepositories.edges || []).flatMap(a =>
      // eslint-disable-next-line no-restricted-syntax
      a?.node ? [readInlineData<RepositoryPickerRepository$key>(RepositoryFragment, a.node)] : [],
    )

    if (initialRepository) {
      if (!nodes.find(node => node.id === initialRepository.id)) {
        nodes = [initialRepository, ...nodes]
      }
    }

    if (organization) {
      nodes = nodes.filter(repo => repo.owner.login === organization)
    }

    if (exclude) {
      nodes = nodes.filter(repo => repo.nameWithOwner !== exclude)
    }

    if (ignoredRepositories) {
      const ignoredSet = new Set(ignoredRepositories)
      nodes = nodes.filter(repo => !ignoredSet.has(repo.nameWithOwner))
    }

    return nodes.slice(0, 10)
  }, [exclude, initialRepository, organization, ignoredRepositories, data])

  useEffect(() => {
    setKnownOrgs([...new Set(fetchedRepos.map(repo => repo.owner.login))])
  }, [fetchedRepos])

  const items = useMemo(() => {
    if (searchResults) return searchResults
    const filteredItems = fetchedRepos.filter(repo => !repo.isArchived)
    if (repositoryFilter) {
      return filteredItems.filter(repositoryFilter)
    }
    return filteredItems
  }, [fetchedRepos, repositoryFilter, searchResults])

  useEffect(() => {
    // automatically select the first repo
    if (!initialRepository && items.length > 0 && !preventDefault) {
      onSelect(items[0])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filterItems = useCallback(
    (value: string) => {
      if (readonly) return
      setFilter(value)
    },
    [readonly],
  )

  const noResultsItem = customNoResultsItem ? {children: customNoResultsItem} : undefined

  return (
    <Box sx={{display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 1}}>
      <ItemPicker
        items={items}
        initialSelectedItems={initialRepository ? [initialRepository] : []}
        filterItems={filterItems}
        getItemKey={getItemKey}
        convertToItemProps={convertToItemProps}
        placeholderText={LABELS.selectRepository}
        selectionVariant="single"
        onSelectionChange={([firstRepo]) => {
          return onSelect(firstRepo)
        }}
        loading={searchLoading}
        renderAnchor={renderAnchor}
        selectPanelRef={repositoryPickerRef}
        enforceAtleastOneSelected={enforceAtleastOneSelected}
        resultListAriaLabel={'Repository results'}
        height={'large'}
        width={'medium'}
        title={title}
        subtitle={subtitle}
        preventClose={preventClose}
        triggerOpen={triggerOpen}
        onOpen={onOpen}
        onClose={onClose}
        customNoResultsItem={noResultsItem}
      />
    </Box>
  )
}
