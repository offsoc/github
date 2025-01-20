import {testIdProps} from '@github-ui/test-id-props'
import {TriangleDownIcon} from '@primer/octicons-react'
import {type BoxProps, Button, SelectPanel, useFocusTrap} from '@primer/react'
import type {ItemProps} from '@primer/react/lib-esm/deprecated/ActionList'
import type {ItemInput} from '@primer/react/lib-esm/deprecated/ActionList/List'
import debounce, {type DebouncedFunc} from 'lodash-es/debounce'
import {useCallback, useEffect, useRef, useState} from 'react'

import {apiSearchRepositories} from '../../api/repository/api-search-repositories'
import type {SuggestedRepository} from '../../api/repository/contracts'
import {BulkAddSidePanelRepoSwitched} from '../../api/stats/contracts'
import {getInitialState} from '../../helpers/initial-state'
import {usePostStats} from '../../hooks/common/use-post-stats'
import {useRepositories} from '../../state-providers/repositories/use-repositories'
import {Resources} from '../../strings'
import {RepositoryIcon} from '../fields/repository/repository-icon'
import {useBulkAddItems} from './bulk-add/bulk-add-items-provider'

type RepoSuggestionsProps = BoxProps & {
  targetRepository?: SuggestedRepository
}

export const RepoSuggestions: React.FC<RepoSuggestionsProps> = ({targetRepository, sx}) => {
  const searchRef = useRef<HTMLInputElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const [query, setQuery] = useState<string>('')
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const [selected, setSelected] = useState<ItemInput | undefined>(undefined)
  const [repositories, setRepositories] = useState<Array<SuggestedRepository>>([])
  const [suggestedRepositories, setSuggestedRepositories] = useState<Array<SuggestedRepository>>([])
  const debouncedSearch = useRef<DebouncedFunc<() => Promise<void>> | undefined>()
  const {suggestRepositories, clearCachedSuggestions} = useRepositories()

  const {postStats} = usePostStats()

  const suggestedRepositoriesRef = useRef(suggestedRepositories)
  const {hasFetchedRepos, setSelectedRepo, setHasFetchedRepos} = useBulkAddItems()

  useFocusTrap({restoreFocusOnCleanUp: true, initialFocusRef: searchRef, containerRef: overlayRef})

  const onClose = useCallback(() => {
    setIsOpen(false)
  }, [])

  const fetchSuggestedRepos = useCallback(async () => {
    if (suggestedRepositoriesRef.current.length) return
    setLoading(true)
    clearCachedSuggestions()
    const suggestedRepos = await suggestRepositories({repositoryId: targetRepository?.id})

    setSuggestedRepositories(suggestedRepos ?? [])
    setHasFetchedRepos(true)
    setLoading(false)
  }, [clearCachedSuggestions, setHasFetchedRepos, suggestRepositories, targetRepository?.id])

  const getRepository = useCallback(
    (repoId: number) => {
      return (query !== '' ? repositories : suggestedRepositories).find(repo => repo.id === repoId)
    },
    [query, repositories, suggestedRepositories],
  )

  useEffect(() => {
    fetchSuggestedRepos()
  }, [fetchSuggestedRepos, setHasFetchedRepos])

  // Set initial selected repo after fetching suggested repos
  useEffect(() => {
    if (hasFetchedRepos && !selected) {
      const locatedRepository = suggestedRepositories.find(repo => repo.id === targetRepository?.id)
      const finalRepository = locatedRepository ?? suggestedRepositories[0]
      if (finalRepository) {
        // Set default selection to first item or target from props
        setSelected({
          id: finalRepository.id,
          text: finalRepository.name,
          leadingVisual: () => RepositoryIcon({repository: finalRepository}),
        })
      }
      setHasFetchedRepos(true)
      // to change the state from the initial `undefined` and to signal that the fetching process has finished and there was nothing to fetch
      // this way we differentiate the initial unset state (undefined) and the empty fetched result (null)
      setSelectedRepo(finalRepository || null)
    }
  }, [setSelectedRepo, setHasFetchedRepos, suggestedRepositories, selected, hasFetchedRepos, targetRepository?.id])

  const onSearchChange = (value: string) => {
    setQuery(value)
    searchRepos()
  }

  const fetchRepos = useCallback(
    async (searchQuery: string) => {
      if (searchQuery !== '') {
        setLoading(true)
        const {repositories: searchedRepos} = await apiSearchRepositories({query: searchQuery})
        setRepositories(searchedRepos)
        setLoading(false)
      } else {
        setRepositories(suggestedRepositories ?? [])
      }
    },
    [suggestedRepositories],
  )

  const searchRepos = useCallback(() => {
    if (debouncedSearch.current) {
      debouncedSearch.current.cancel()
    }
    debouncedSearch.current = debounce(() => fetchRepos(query), 200)
    debouncedSearch.current()
  }, [fetchRepos, query])

  const onSelectedChange = (selectedItem?: ItemInput) => {
    if (selectedItem?.id) {
      const repo = getRepository(selectedItem.id as number)
      if (repo) {
        setSelected({
          id: repo.id,
          text: repo.name,
          leadingVisual: () => RepositoryIcon({repository: repo}),
        })

        setSelectedRepo(repo)
        postStats({name: BulkAddSidePanelRepoSwitched, context: JSON.stringify({repo: repo.name})})
      }
    }
  }

  const displayedItems = (query !== '' ? repositories : suggestedRepositories).map<ItemProps>(repoItem => {
    const {projectOwner} = getInitialState()
    const repoOwner = repoItem.nameWithOwner.split('/')[0]
    const name = repoOwner?.toLowerCase() !== projectOwner?.login.toLowerCase() ? repoItem.nameWithOwner : repoItem.name

    return {
      ...repoItem,
      text: name,
      leadingVisual: () => RepositoryIcon({repository: repoItem}),
      selectionVariant: 'single',
      descriptionVariant: 'block',
      selected: undefined,
      onAction: (_, event) => {
        event.preventDefault()
        onSelectedChange(repoItem)
        onClose()
      },
    }
  })

  return (
    <SelectPanel
      placeholderText={Resources.repoPickerFilterPlaceholder}
      open={isOpen}
      renderAnchor={({children, ...anchorProps}) => (
        <Button
          leadingVisual={selected?.leadingVisual}
          trailingVisual={TriangleDownIcon}
          sx={sx}
          {...anchorProps}
          {...testIdProps('repo-suggestions-button')}
        >
          {children || Resources.selectRepo}
        </Button>
      )}
      onOpenChange={() => setIsOpen(true)}
      loading={loading}
      selected={selected}
      filterValue={query}
      items={displayedItems}
      showItemDividers
      onFilterChange={onSearchChange}
      onSelectedChange={onSelectedChange}
      overlayProps={{
        width: 'small',
        onMouseDown: e => e.stopPropagation(),
        height: 'auto',
        onClickOutside: onClose,
        ...testIdProps('repo-picker-repo-list'),
      }}
    />
  )
}

RepoSuggestions.displayName = 'RepoSuggestions'
