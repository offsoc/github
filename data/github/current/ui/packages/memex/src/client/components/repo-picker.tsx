import {testIdProps} from '@github-ui/test-id-props'
import {ArrowRightIcon} from '@primer/octicons-react'
import {
  ActionList,
  AnchoredOverlay,
  type AnchoredOverlayProps,
  Box,
  SelectPanel,
  Text,
  useFocusTrap,
} from '@primer/react'
import type {ItemProps} from '@primer/react/lib-esm/deprecated/ActionList'
import type {ItemInput} from '@primer/react/lib-esm/deprecated/ActionList/List'
import {useProvidedRefOrCreate} from '@primer/react/lib-esm/hooks/useProvidedRefOrCreate'
import debounce, {type DebouncedFunc} from 'lodash-es/debounce'
import {useCallback, useEffect, useRef, useState} from 'react'

import type {SidePanelItem} from '../api/memex-items/side-panel-item'
import {apiSearchRepositories} from '../api/repository/api-search-repositories'
import type {SuggestedRepository} from '../api/repository/contracts'
import type {DraftIssueModel} from '../models/memex-item-model'
import {useRepositories} from '../state-providers/repositories/use-repositories'
import {Resources} from '../strings'
import {RepositoryIcon} from './fields/repository/repository-icon'
import {useConvertToIssueHook} from './react_table/use-convert-to-issue-hook'

interface AnchoredOverlayPropsWithAnchor {
  renderAnchor: <T extends React.HTMLAttributes<HTMLElement>>(props: T) => JSX.Element
  anchorRef?: React.RefObject<HTMLElement>
}
interface AnchoredOverlayPropsWithoutAnchor {
  renderAnchor?: <T extends React.HTMLAttributes<HTMLElement>>(props: T) => JSX.Element
  anchorRef: React.RefObject<HTMLElement>
}

interface RepoPickerBaseProps {
  isOpen: boolean
  showPrompt?: boolean
  onSuccess?: (repository: SuggestedRepository) => void
  promptOptions?: {
    title?: string
    description?: string
  }
  item: SidePanelItem
  onOpenChange: (
    open: boolean,
    gesture: 'anchor-click' | 'anchor-key-press' | 'click-outside' | 'escape' | 'selection' | 'convert-confirmation',
  ) => void
}

type RepoPickerProps = RepoPickerBaseProps & (AnchoredOverlayPropsWithAnchor | AnchoredOverlayPropsWithoutAnchor)

export const RepoPicker: React.FC<RepoPickerProps> = ({
  isOpen,
  anchorRef: externalAnchorRef,
  renderAnchor = () => <div />,
  showPrompt = false,
  onOpenChange,
  onSuccess,
  item,
  promptOptions = {title: Resources.draftConvertPromptTitle, description: Resources.draftConvertPromptDescription},
}) => {
  const searchRef = useRef<HTMLInputElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [shouldShowPrompt, setShouldShowPrompt] = useState(showPrompt)
  const [repositories, setRepositories] = useState<Array<SuggestedRepository>>([])
  const [suggestedRepositories, setSuggestedRepositories] = useState<Array<SuggestedRepository>>([])
  const debouncedSearch = useRef<DebouncedFunc<() => Promise<void>> | undefined>()
  const {suggestRepositories} = useRepositories()
  const {start: convertToIssue} = useConvertToIssueHook()
  const anchorRef = useProvidedRefOrCreate(externalAnchorRef)
  useFocusTrap({restoreFocusOnCleanUp: true, initialFocusRef: searchRef, containerRef: overlayRef})

  const onClose = useCallback(
    (
      gesture:
        | Parameters<Exclude<AnchoredOverlayProps['onClose'], undefined>>[0]
        | 'selection'
        | 'convert-confirmation',
    ) => {
      onOpenChange(false, gesture)
    },
    [onOpenChange],
  )

  const startConvertToIssue = useCallback(
    async (repository: SuggestedRepository) => {
      await convertToIssue(item as DraftIssueModel, repository)
    },
    [convertToIssue, item],
  )

  const fetchSuggestedRepos = useCallback(async () => {
    if (suggestedRepositories.length) return
    setLoading(true)
    const suggestedRepos = await suggestRepositories()
    setSuggestedRepositories(suggestedRepos ?? [])
    // Set default selection to first item
    setLoading(false)
    // The dependencies it wants causes a recursive loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const getRepository = useCallback(
    (repoId: number) => {
      return (query !== '' ? repositories : suggestedRepositories).find(repo => repo.id === repoId)
    },
    [query, repositories, suggestedRepositories],
  )

  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setRepositories([])
      fetchSuggestedRepos()
    }
  }, [fetchSuggestedRepos, isOpen])

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
    (searchQuery: string) => {
      if (debouncedSearch.current) {
        debouncedSearch.current.cancel()
      }
      debouncedSearch.current = debounce(() => fetchRepos(searchQuery), 200)
      debouncedSearch.current()
    },
    [fetchRepos],
  )

  const onSelectedChange = (selected?: ItemInput) => {
    if (selected?.id) {
      const repo = getRepository(selected.id as number)
      if (repo) {
        startConvertToIssue(repo)
        onSuccess?.(repo)
      }
    }
  }

  const onCloseClick = () => {
    onClose('click-outside')
  }

  const availableRepositories = (query !== '' ? repositories : suggestedRepositories).filter(
    repo => !repo.isArchived && repo.hasIssues,
  )

  const displayedItems = availableRepositories.map<ItemProps>(repoItem => {
    return {
      ...repoItem,
      text: repoItem.name,
      leadingVisual: () => RepositoryIcon({repository: repoItem}),
      selectionVariant: 'single',
      descriptionVariant: 'block',
      selected: undefined,
      onAction: (_, event) => {
        event.preventDefault()
        onSelectedChange(repoItem)
        onOpenChange(false, 'convert-confirmation')
      },
    }
  })

  if (shouldShowPrompt) {
    return (
      <AnchoredOverlay
        anchorRef={anchorRef}
        renderAnchor={renderAnchor}
        open={isOpen}
        overlayProps={{
          onEscape: onCloseClick,
          onClickOutside: onCloseClick,
        }}
        width="small"
      >
        {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
        <div onClick={e => e.stopPropagation()}>
          <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'stretch', m: 2}}>
            <ActionList.Item
              onSelect={() => setShouldShowPrompt(false)}
              {...testIdProps('draft-prompt-convert-to-issue')}
            >
              <Box sx={{display: 'flex', flexDirection: 'column'}}>
                <Text sx={{display: 'flex', fontSize: 14, fontWeight: 'bold', p: 0}}>{promptOptions.title}</Text>
                <Text sx={{display: 'flex', fontSize: 12, p: 0, color: 'fg.muted'}}>{promptOptions.description}</Text>
              </Box>
              <ActionList.TrailingVisual>
                <ArrowRightIcon />
              </ActionList.TrailingVisual>
            </ActionList.Item>
          </Box>
        </div>
      </AnchoredOverlay>
    )
  }
  return (
    <SelectPanel
      placeholderText={Resources.repoPickerFilterPlaceholder}
      open={isOpen}
      anchorRef={anchorRef}
      renderAnchor={renderAnchor}
      onOpenChange={onOpenChange}
      loading={loading}
      selected={undefined}
      filterValue={query}
      items={displayedItems}
      showItemDividers
      onFilterChange={onSearchChange}
      onSelectedChange={onSelectedChange}
      overlayProps={{
        width: 'small',
        onMouseDown: e => e.stopPropagation(),
        height: 'small',
        onClickOutside: onCloseClick,
        ...testIdProps('repo-picker-repo-list'),
      }}
    />
  )
}

RepoPicker.displayName = 'RepoPicker'
