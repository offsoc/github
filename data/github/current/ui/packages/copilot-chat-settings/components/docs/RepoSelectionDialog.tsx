import {debounce} from '@github/mini-throttle'
import type {RepoData} from '@github-ui/copilot-chat/utils/copilot-chat-types'
import {GitHubAvatar} from '@github-ui/github-avatar'
import {ListView} from '@github-ui/list-view'
import {ListItemLeadingContent} from '@github-ui/list-view/ListItemLeadingContent'
import {ListItemTitle} from '@github-ui/list-view/ListItemTitle'
import {ListItem} from '@github-ui/list-view/ListItem'
import {useRepositoryItems} from '@github-ui/use-repository-items'
import {SearchIcon} from '@primer/octicons-react'
import {Box, Spinner, TextInput, Button} from '@primer/react'
import {Blankslate, Dialog} from '@primer/react/drafts'
import {useCallback, useState, useMemo, useEffect} from 'react'
import {pluralizeRepositories, pluralizeResults} from '../../utils/pluralize'
import {useDelayedLoading} from '../../utils/use-delayed-loading'

export interface RepoSelectionDialogProps {
  initialFilterText?: string
  // If provided, repos owned by this user login will be sorted to the top
  prefferedUserLogin?: string
  onClose: (selectedItems: RepoData[]) => void
  initialSelectedItems: RepoData[]
  // Allows for modification of the user's query prior to hitting the API. ex. adding org:<org> to get only <org>'s repos
  isOpen: boolean
}

interface LoadMoreProps {
  currentCount: number
  totalCount: number
  loadMore: (endCursor: string, afterFetch: () => void) => void
  loading: boolean
  endCursor: string | null
}

export const DIALOG_LABEL = 'Add repositories'

/**
 * This is the dialog used to select repositories for inclusion in a docset.
 */
export function RepoSelectionDialog({
  initialFilterText = '',
  prefferedUserLogin = '',
  initialSelectedItems,
  isOpen,
  onClose,
}: RepoSelectionDialogProps) {
  // Reusing filterText to query repos causes the value in the TextInput to not update until debouncedSetFilter runs so we are using 2 separate states
  const [filterText, setFilterText] = useState(initialFilterText)
  const [filterQuery, setFilterQuery] = useState(initialFilterText)
  // Don't send off new filter queries if the user is typing
  const debouncedSetFilter = useMemo(() => debounce((newFilter: string) => setFilterQuery(newFilter), 400), [])
  const {repositories, loading, totalCount, loadMore, endCursor} = useRepositoryItems(filterQuery)
  const [selectedItems, setSelectedItems] = useState<RepoData[]>([])
  const isLoading = useDelayedLoading(loading)
  const onSelected = useCallback((item: RepoData, isSelected: boolean) => {
    if (isSelected) {
      setSelectedItems(items => [...items, item])
    } else {
      setSelectedItems(items => items.filter(i => i.nameWithOwner !== item.nameWithOwner))
    }
  }, [])
  const setFilterTextAndQuery = useCallback(
    (newFilter: string) => {
      setFilterText(newFilter)
      debouncedSetFilter(newFilter)
    },
    [debouncedSetFilter],
  )
  const onCancel = useCallback(() => {
    setSelectedItems([])
    setFilterTextAndQuery(initialFilterText)
    onClose(initialSelectedItems)
  }, [setFilterTextAndQuery, initialFilterText, onClose, initialSelectedItems])
  const onOk = useCallback(() => {
    setSelectedItems([])
    setFilterTextAndQuery(initialFilterText)
    onClose([...initialSelectedItems, ...selectedItems])
  }, [setFilterTextAndQuery, initialFilterText, onClose, initialSelectedItems, selectedItems])
  if (!isOpen) {
    return null
  }

  return (
    <Dialog
      footerButtons={[
        {buttonType: 'normal', content: 'Cancel', onClick: onCancel},
        {buttonType: 'primary', content: 'Apply', onClick: onOk},
      ]}
      renderFooter={({footerButtons}) => {
        return (
          <Dialog.Footer
            sx={{
              '@media screen and (max-height: 400px)': {p: 2},
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span>{pluralizeRepositories(selectedItems.length)} selected</span>
            {footerButtons && (
              <Box sx={{display: 'flex', gap: 2}}>
                <Dialog.Buttons buttons={footerButtons} />
              </Box>
            )}
          </Dialog.Footer>
        )
      }}
      onClose={onCancel}
      title={DIALOG_LABEL}
      sx={{
        // Using 600px to match the value of the --overlay-height-xlarge, since CSS variables are not avaialbe in media queries.
        '@media screen and (max-height: 600px)': {maxHeight: 'calc(100vh - 8px)'},
        maxHeight: 'var(--overlay-height-xlarge)',
      }}
      renderBody={() => (
        <Dialog.Body sx={{padding: 0, display: 'flex', flexDirection: 'column'}}>
          <TextInput
            leadingVisual={SearchIcon}
            sx={{flex: 1, m: 2}}
            placeholder="Search repositories"
            onChange={e => setFilterTextAndQuery(e.target.value)}
            value={filterText}
            loaderPosition="trailing"
          />
          {isLoading ? (
            <Blankslate>
              <Spinner aria-label="Loading" />
            </Blankslate>
          ) : repositories.length === 0 ? (
            <Blankslate>No results found.</Blankslate>
          ) : (
            <div>
              <ListView isSelectable={true} title="Repositories" variant="compact">
                {repositories
                  .filter(repo => !initialSelectedItems.map(r => r.nameWithOwner).includes(repo.nameWithOwner))
                  // sort repositories owned by the current org first
                  .sort(
                    (a, b) =>
                      ((b.owner.login === prefferedUserLogin) as unknown as number) -
                      ((a.owner.login === prefferedUserLogin) as unknown as number),
                  )
                  .map(repo => (
                    <ListItem
                      key={repo.name}
                      isSelected={selectedItems.some(i => i.nameWithOwner === repo.nameWithOwner)}
                      onSelect={isSelected => onSelected(repo, isSelected)}
                      sx={{border: 'none !important'}}
                      title={<ListItemTitle value={repo.nameWithOwner} />}
                    >
                      <ListItemLeadingContent sx={{alignItems: 'center', display: 'flex'}}>
                        <GitHubAvatar src={repo.owner.avatarUrl} square={repo.isInOrganization} size={16} />
                      </ListItemLeadingContent>
                    </ListItem>
                  ))}
                <LoadMore
                  currentCount={repositories.length}
                  totalCount={totalCount}
                  loadMore={loadMore}
                  loading={loading}
                  endCursor={endCursor}
                />
              </ListView>
            </div>
          )}
          <span role="status" className="sr-only">
            {pluralizeResults(repositories.length)} returned.
          </span>
        </Dialog.Body>
      )}
    />
  )
}

const LoadMore = ({currentCount, totalCount, loadMore, loading, endCursor}: LoadMoreProps) => {
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  const handleLoadMore = useCallback(() => {
    if (endCursor === null) {
      return
    }
    setIsLoadingMore(true)
    loadMore(endCursor, () => setIsLoadingMore(false))
  }, [loadMore, endCursor])

  useEffect(() => {
    if (!loading) {
      setIsLoadingMore(false)
    }
  }, [loading])

  const content = useMemo(() => {
    if (isLoadingMore) {
      return (
        <Box sx={{py: 1, px: 0}}>
          <Spinner aria-label="Loading" />
        </Box>
      )
    }

    return (
      <Button variant="invisible" onClick={handleLoadMore}>
        Load more
      </Button>
    )
  }, [isLoadingMore, handleLoadMore])

  if (currentCount >= totalCount) {
    return null
  }

  return <Box sx={{my: 2, display: 'flex', justifyContent: 'center'}}>{content}</Box>
}
