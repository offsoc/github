import {LoadingSkeleton} from '@github-ui/skeleton/LoadingSkeleton'
import {testIdProps} from '@github-ui/test-id-props'
import {TriangleDownIcon} from '@primer/octicons-react'
import {type BoxProps, Button, SelectPanel, useFocusTrap} from '@primer/react'
import type {ItemProps} from '@primer/react/lib-esm/deprecated/ActionList'
import type {ItemInput} from '@primer/react/lib-esm/deprecated/ActionList/List'
import debounce, {type DebouncedFunc} from 'lodash-es/debounce'
import {useCallback, useEffect, useRef, useState} from 'react'

import {apiSearchRepositories} from '../../api/repository/api-search-repositories'
import type {SuggestedRepository} from '../../api/repository/contracts'
import {getInitialState} from '../../helpers/initial-state'
import {useRepositories} from '../../state-providers/repositories/use-repositories'
import {Resources} from '../../strings'
import {RepositoryIcon} from '../fields/repository/repository-icon'
import {SEARCH_DEBOUNCE_DELAY_MS} from './helpers/search-constants'

type RepositoryPickerProps = BoxProps & {
  onRepositorySelected: (repo: SuggestedRepository) => void
  onNoSuggestedRepositories?: () => void
  isEditing?: boolean
  targetRepositoryId?: number
  shouldReset?: boolean
}

// TODO: Refactor this component and the repo-suggestions component to share the logic for searching and setting repo
export const RepositoryPicker: React.FC<RepositoryPickerProps> = ({
  targetRepositoryId,
  isEditing,
  onRepositorySelected,
  onNoSuggestedRepositories,
  sx,
}) => {
  const searchRef = useRef<HTMLInputElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const [query, setQuery] = useState<string>('')
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const [selected, setSelected] = useState<ItemInput | undefined>(undefined)

  const [repositories, setRepositories] = useState<Array<SuggestedRepository>>([])
  const [suggestedRepositories, setSuggestedRepositories] = useState<Array<SuggestedRepository>>([])
  const debouncedSearch = useRef<DebouncedFunc<() => Promise<void>> | undefined>()
  const {suggestRepositories} = useRepositories()

  // non render states
  const suggestedRepositoriesRef = useRef(suggestedRepositories)
  const fetchCountRef = useRef(0)
  const loadingRef = useRef(false)

  useFocusTrap({restoreFocusOnCleanUp: true, initialFocusRef: searchRef, containerRef: overlayRef})

  const onClose = useCallback(() => {
    setIsOpen(false)
  }, [])

  const fetchSuggestedRepos = useCallback(async () => {
    if (suggestedRepositoriesRef.current.length) return
    if (loadingRef.current) return

    loadingRef.current = true
    setLoading(true)

    const suggestedRepos = await suggestRepositories({repositoryId: targetRepositoryId})
    fetchCountRef.current += 1
    if (suggestedRepos) suggestedRepositoriesRef.current = suggestedRepos
    if (suggestedRepos) setSuggestedRepositories(suggestedRepos)

    loadingRef.current = false
    setLoading(false)
  }, [suggestRepositories, targetRepositoryId])

  const getRepository = useCallback(
    (repoId: number) => {
      return (query !== '' ? repositories : suggestedRepositories).find(repo => repo.id === repoId)
    },
    [query, repositories, suggestedRepositories],
  )

  const resetRepositorySelection = useCallback(() => {
    const locatedRepository = suggestedRepositories.find(repo => repo.id === targetRepositoryId)
    const finalRepository = locatedRepository ? locatedRepository : suggestedRepositories[0]
    if (finalRepository) {
      // Set default selection to first item or target from props
      setSelected({
        id: finalRepository.id,
        text: finalRepository.name,
        leadingVisual: () => RepositoryIcon({repository: finalRepository}),
      })
      onRepositorySelected(finalRepository)
    }
  }, [suggestedRepositories, targetRepositoryId, onRepositorySelected])

  // Set initial selected repo after fetching suggested repos
  useEffect(() => {
    if (!selected) {
      resetRepositorySelection()
    }
  }, [resetRepositorySelection, selected])

  // Reset if the targetRepositoryId updates (e.g. discard)
  useEffect(() => {
    if (selected?.id !== targetRepositoryId) {
      resetRepositorySelection()
    }
  }, [resetRepositorySelection, selected?.id, targetRepositoryId])

  // fetch suggested repos on render
  useEffect(() => {
    if (loadingRef.current) return

    if (fetchCountRef.current === 0) {
      fetchSuggestedRepos()
      // Re-fetch suggested repos if the targetRepositoryId is not in the list
    } else if (
      targetRepositoryId &&
      !suggestedRepositories.find(repo => repo.id === targetRepositoryId) &&
      fetchCountRef.current < 2
    ) {
      suggestedRepositoriesRef.current = []
      fetchSuggestedRepos()
    } else if (suggestedRepositoriesRef.current.length === 0 && onNoSuggestedRepositories) {
      onNoSuggestedRepositories()
    }
  }, [fetchSuggestedRepos, onNoSuggestedRepositories, suggestedRepositories, targetRepositoryId])

  const onSearchChange = (value: string) => {
    setQuery(value)
    searchRepos(value)
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

  const searchRepos = useCallback(
    (value: string) => {
      if (debouncedSearch.current) {
        debouncedSearch.current.cancel()
      }
      debouncedSearch.current = debounce(() => fetchRepos(value), SEARCH_DEBOUNCE_DELAY_MS)
      debouncedSearch.current()
    },
    [fetchRepos],
  )

  const onSelectedChange = (selectedItem?: ItemInput) => {
    if (selectedItem?.id) {
      const repo = getRepository(selectedItem.id as number)
      if (repo) {
        setSelected({
          id: repo.id,
          text: repo.name,
          leadingVisual: () => RepositoryIcon({repository: repo}),
        })
        onRepositorySelected(repo)

        // TODO: postStats?
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
    <>
      {suggestedRepositories.length > 0 ? (
        <SelectPanel
          placeholderText={Resources.repoPickerFilterPlaceholder}
          open={isOpen}
          renderAnchor={({children, ...anchorProps}) => (
            <Button
              sx={sx}
              disabled={!selected || !isEditing}
              leadingVisual={selected?.leadingVisual}
              trailingVisual={TriangleDownIcon}
              {...anchorProps}
              {...testIdProps('repo-suggestions-button')}
            >
              {/* eslint-disable-next-line i18n-text/no-en */}
              {children || 'Select Repo'}
            </Button>
          )}
          onOpenChange={open => setIsOpen(open)}
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
      ) : (
        <LoadingSkeleton variant="rounded" width="138px" height="32px" />
      )}
    </>
  )
}

RepositoryPicker.displayName = 'RepositoryPicker'
