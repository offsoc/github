import {ListView} from '@github-ui/list-view'
import {ListItemLeadingContent} from '@github-ui/list-view/ListItemLeadingContent'
import {ListItemTitle} from '@github-ui/list-view/ListItemTitle'
import {ListItem} from '@github-ui/list-view/ListItem'
import {RepoLockedIcon, SearchIcon} from '@primer/octicons-react'
import {Box, Button, Octicon, Spinner, TextInput} from '@primer/react'
import {Dialog} from '@primer/react/drafts'
import {useCallback, useMemo, useState} from 'react'
import type {IndexedRepo} from '../types/indexed-repo'
import {type RepoItem, useRepositoryItems} from '@github-ui/use-repository-items'
import {debounce} from '@github/mini-throttle'

export interface RepoSelectionDialogProps {
  currentOrg: string
  onClose: () => void
  onSubmit: (selectedRepos: IndexedRepo[]) => void
  indexedRepos: IndexedRepo[]
  processing: boolean
  quotaRemaining: number
}

/**
 * This is the dialog used to select repositories to be indexed.
 */
export function RepoSelectionDialog({
  currentOrg,
  onClose,
  onSubmit,
  indexedRepos,
  processing,
  quotaRemaining,
}: RepoSelectionDialogProps) {
  const [filterText, setFilterText] = useState('')
  const [filterQuery, setFilterQuery] = useState(`org:${currentOrg} `)
  // Don't send off new filter queries if the user is typing
  const debouncedSetFilter = debounce(
    // Replace all colons with spaces to force an org search.
    (newFilter: string) => setFilterQuery(`org:${currentOrg} ${newFilter.replaceAll(':', ' ')}`),
    400,
    {start: false},
  )
  const {repositories, loading} = useRepositoryItems(filterQuery)
  const [selectedItems, setSelectedItems] = useState<RepoItem[]>([])
  const onSelected = useCallback((item: RepoItem, isSelected: boolean) => {
    if (isSelected) {
      setSelectedItems(items => [...items, item])
    } else {
      setSelectedItems(items => items.filter(i => i.id !== item.id))
    }
  }, [])

  const filteredRepos = useMemo(
    () => repositories.filter(repo => !indexedRepos.find(r => r.name === repo.name)),
    [indexedRepos, repositories],
  )

  const setFilterTextAndQuery = useCallback(
    (newFilter: string) => {
      setFilterText(newFilter)
      debouncedSetFilter(newFilter)
    },
    [debouncedSetFilter],
  )

  return (
    <Dialog
      onClose={onClose}
      title="Pick repositories"
      renderBody={() => (
        <Dialog.Body sx={{padding: 0, display: 'flex', flexDirection: 'column'}}>
          <TextInput
            leadingVisual={SearchIcon}
            sx={{flex: 1, m: 2}}
            placeholder="Search repositories"
            onChange={e => setFilterTextAndQuery(e.target.value)}
            value={filterText}
            loading={loading}
            loaderPosition="trailing"
          />
          <div>
            {filteredRepos.length === 0 && !loading ? (
              <Box sx={{ml: 2, mb: 2}}>No repositories found.</Box>
            ) : (
              <ListView isSelectable={true} title="Repositories" variant="compact">
                {filteredRepos.map(repo => (
                  <ListItem
                    key={repo.id}
                    isSelected={selectedItems.includes(repo)}
                    onSelect={isSelected => onSelected(repo, isSelected)}
                    sx={{border: 'none !important'}}
                    title={<ListItemTitle value={repo.nameWithOwner} />}
                  >
                    <ListItemLeadingContent sx={{alignItems: 'center', display: 'flex'}}>
                      <Octicon icon={RepoLockedIcon} />
                    </ListItemLeadingContent>
                  </ListItem>
                ))}
              </ListView>
            )}
          </div>
        </Dialog.Body>
      )}
      renderFooter={() => (
        <Dialog.Footer>
          {processing && <Spinner />}
          {selectedItems.length > quotaRemaining && (
            <Box sx={{color: 'danger.fg', mr: 2}}>
              {`You have selected ${selectedItems.length} repositories, but only ${quotaRemaining} are available.`}
            </Box>
          )}
          <Button onClick={onClose}>Cancel</Button>
          <Button
            disabled={selectedItems.length > quotaRemaining}
            variant="primary"
            onClick={() =>
              onSubmit(
                selectedItems.map(i => ({
                  name: i.name,
                  owner: i.owner.login,
                  id: i.id,
                  description: i.shortDescriptionHTML,
                })),
              )
            }
          >
            Apply
          </Button>
        </Dialog.Footer>
      )}
    />
  )
}
