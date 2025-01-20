import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import {ActionList, Box, Button, Heading, Text} from '@primer/react'
import {ListView} from '@github-ui/list-view'
import {ListViewMetadata} from '@github-ui/list-view/ListViewMetadata'
import {ListItemActionBar} from '@github-ui/list-view/ListItemActionBar'
import {ListItemDescription} from '@github-ui/list-view/ListItemDescription'
import {ListItemLeadingContent} from '@github-ui/list-view/ListItemLeadingContent'
import {ListItemLeadingVisual} from '@github-ui/list-view/ListItemLeadingVisual'
import {ListItemMainContent} from '@github-ui/list-view/ListItemMainContent'
import {ListItemTitle} from '@github-ui/list-view/ListItemTitle'
import {ListItem} from '@github-ui/list-view/ListItem'
import {verifiedFetch} from '@github-ui/verified-fetch'
import {PlusIcon, RepoLockedIcon, TrashIcon} from '@primer/octicons-react'
import {useCallback, useState} from 'react'
import {RepoSelectionDialog} from '../components/RepoSelectionDialog'
import {RemoveIndexedReposDialog} from '../components/RemoveIndexedReposDialog'
import type {IndexedRepo} from '../types/indexed-repo'
import {relayEnvironmentWithMissingFieldHandlerForNode} from '@github-ui/relay-environment'
import {RelayEnvironmentProvider} from 'react-relay'

export interface SemanticCodeSearchSettingsPayload {
  canIndexRepos: boolean
  initialIndexedRepos: IndexedRepo[]
  quota: number
  orgName: string
}

export function SemanticCodeSearchSettings() {
  const payload = useRoutePayload<SemanticCodeSearchSettingsPayload>()
  const {canIndexRepos, initialIndexedRepos, quota, orgName} = payload
  const [selectedRepos, setSelectedRepos] = useState<Set<string>>(new Set<string>())
  const [removeDialogRepos, setRemoveDialogRepos] = useState<string[]>([])
  const [showRepoSelectionDialog, setShowRepoSelectionDialog] = useState<boolean>(false)
  const [indexedRepos, setIndexedRepos] = useState<IndexedRepo[]>([...initialIndexedRepos])
  const [error, setError] = useState<string | null>(null)
  const [addingRepos, setAddingRepos] = useState(false)
  const [removingRepos, setRemovingRepos] = useState(false)
  const environment = relayEnvironmentWithMissingFieldHandlerForNode()

  const onSelect = useCallback(
    (repoNameWithOwner: string, selected: boolean) => {
      if (selected) {
        if (!selectedRepos.has(repoNameWithOwner)) {
          setSelectedRepos(new Set<string>(selectedRepos.add(repoNameWithOwner)))
        }
      } else {
        selectedRepos.delete(repoNameWithOwner)
        setSelectedRepos(new Set<string>(selectedRepos))
      }
    },
    [selectedRepos, setSelectedRepos],
  )

  const onRemoveSelectedIndexes = useCallback(() => {
    setRemoveDialogRepos(Array.from(selectedRepos.keys()))
  }, [selectedRepos])

  const onRemoveSubmit = useCallback(async () => {
    setRemovingRepos(true)
    setError(null)
    const nwos = removeDialogRepos.map(repo => encodeURIComponent(repo))
    const resp = await verifiedFetch(`/search/index_embeddings?nwos=${JSON.stringify(nwos)}`, {method: 'DELETE'})
    if (resp.ok) {
      const newIndexedRepos = indexedRepos.filter(repo => !removeDialogRepos.includes(nameWithOwner(repo)))
      setIndexedRepos(newIndexedRepos)
      setSelectedRepos(new Set<string>())
    } else {
      setError('Failed to delete repositories')
    }
    setRemovingRepos(false)
    setRemoveDialogRepos([])
  }, [indexedRepos, removeDialogRepos])

  const onCloseRemoveDialog = useCallback(() => {
    setRemoveDialogRepos([])
  }, [])

  const onSubmitAddRepos = useCallback(
    async (reposToAdd: IndexedRepo[]) => {
      setAddingRepos(true)
      setError(null)
      const nwos = reposToAdd.map(repo => encodeURIComponent(nameWithOwner(repo)))
      const resp = await verifiedFetch(`/search/index_embeddings?nwos=${JSON.stringify(nwos)}`, {method: 'POST'})
      if (resp.ok) {
        setIndexedRepos([...indexedRepos, ...reposToAdd])
      } else {
        setError('Failed to add repositories')
      }
      setShowRepoSelectionDialog(false)
      setAddingRepos(false)
    },
    [indexedRepos],
  )

  const onShowRepoSelectionDialog = useCallback(() => {
    setShowRepoSelectionDialog(true)
  }, [])

  const onCloseRepoSelectionDialog = useCallback(() => {
    setShowRepoSelectionDialog(false)
  }, [])

  return (
    <RelayEnvironmentProvider environment={environment}>
      <main>
        <div data-view-component="true" className="Subhead">
          <h2 data-view-component="true" className="Subhead-heading">
            Semantic code search
          </h2>
        </div>

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            border: '1px solid',
            borderColor: 'border.muted',
            padding: 3,
            mb: 3,
          }}
        >
          <Text sx={{fontWeight: 'bold'}}>Search index quota remaining</Text>
          <Text sx={{fontSize: '24px'}}>
            {Math.max(quota - indexedRepos.length, 0)} of {quota}
          </Text>
          <Text sx={{color: 'fg.muted'}}>
            Number of remaining repositories that can be indexed for semantic code search in this organization.
          </Text>
        </Box>
        <div>
          <Box sx={{display: 'flex'}}>
            <Heading as="h3" sx={{flexGrow: 1, fontSize: '20px', mb: 3}} id="indexed-repositories-table-header">
              Indexed Repositories
            </Heading>
            {indexedRepos.length < quota && canIndexRepos ? (
              <Button leadingVisual={PlusIcon} variant="primary" onClick={onShowRepoSelectionDialog}>
                Add repositories
              </Button>
            ) : (
              <Box sx={{display: 'flex', pb: 3, alignItems: 'flex-end'}}>
                {canIndexRepos
                  ? '0 code search index quota remaining.'
                  : 'Only users with copilot chat access can index repositories.'}
              </Box>
            )}
          </Box>
          {error && <Box sx={{color: 'danger.fg', mb: 2}}>{error}</Box>}
          <Box sx={{border: '1px solid', borderColor: 'border.muted'}}>
            <ListView
              data-hpc
              title="Indexed Repositiories"
              variant="compact"
              isSelectable={indexedRepos.length > 0 && canIndexRepos}
              metadata={
                <ListViewMetadata
                  actionsLabel="Actions"
                  onToggleSelectAll={isSelectAllChecked => {
                    if (isSelectAllChecked) {
                      setSelectedRepos(new Set(indexedRepos.map(repo => nameWithOwner(repo))))
                    } else {
                      setSelectedRepos(new Set())
                    }
                  }}
                  actions={
                    selectedRepos.size > 0 && canIndexRepos
                      ? [
                          {
                            key: 'remove-indexes',
                            render: (isOverflowMenu: boolean) => {
                              return isOverflowMenu ? (
                                <ActionList.Item onSelect={onRemoveSelectedIndexes}>
                                  <ActionList.LeadingVisual>
                                    <TrashIcon />
                                  </ActionList.LeadingVisual>
                                  Remove indexes
                                </ActionList.Item>
                              ) : (
                                <Button leadingVisual={TrashIcon} onClick={onRemoveSelectedIndexes}>
                                  Remove indexes
                                </Button>
                              )
                            },
                          },
                        ]
                      : []
                  }
                />
              }
            >
              {indexedRepos.length === 0 ? (
                <ListItem
                  sx={{justifyContent: 'center'}}
                  title={<ListItemTitle value="No indexed repositories found." />}
                />
              ) : (
                indexedRepos.map(repo => (
                  <ListItem
                    key={repo.name}
                    isSelected={selectedRepos.has(nameWithOwner(repo))}
                    onSelect={selected => onSelect(nameWithOwner(repo), selected)}
                    title={<ListItemTitle value={repo.name} />}
                    secondaryActions={
                      <ListItemActionBar
                        staticMenuActions={
                          canIndexRepos
                            ? [
                                {
                                  key: 'remove-index',
                                  render: () => (
                                    <ActionList.Item onSelect={() => setRemoveDialogRepos([nameWithOwner(repo)])}>
                                      Remove index
                                    </ActionList.Item>
                                  ),
                                },
                              ]
                            : []
                        }
                      />
                    }
                  >
                    <ListItemLeadingContent>
                      <ListItemLeadingVisual icon={RepoLockedIcon} color={'fg.muted'} />
                    </ListItemLeadingContent>
                    <ListItemMainContent>
                      <ListItemDescription>{repo.description}</ListItemDescription>
                    </ListItemMainContent>
                  </ListItem>
                ))
              )}
            </ListView>
          </Box>
        </div>
        {removeDialogRepos.length > 0 && (
          <RemoveIndexedReposDialog
            onClose={onCloseRemoveDialog}
            onSubmit={onRemoveSubmit}
            repos={removeDialogRepos}
            processing={removingRepos}
          />
        )}
        {showRepoSelectionDialog && (
          <RepoSelectionDialog
            onClose={onCloseRepoSelectionDialog}
            onSubmit={onSubmitAddRepos}
            indexedRepos={indexedRepos}
            processing={addingRepos}
            quotaRemaining={quota - indexedRepos.length}
            currentOrg={orgName}
          />
        )}
      </main>
    </RelayEnvironmentProvider>
  )
}

const nameWithOwner = (repo: IndexedRepo) => {
  return `${repo.owner}/${repo.name}`
}
