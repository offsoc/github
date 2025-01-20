import {useState, useCallback, useEffect, useMemo} from 'react'
import capitalize from 'lodash-es/capitalize'
import pluralize from 'pluralize'
import {ListView} from '@github-ui/list-view'
import {ListViewMetadata} from '@github-ui/list-view/ListViewMetadata'
import {ListItemDescription} from '@github-ui/list-view/ListItemDescription'
import {ListItemMainContent} from '@github-ui/list-view/ListItemMainContent'
import {ListItemTitle} from '@github-ui/list-view/ListItemTitle'
import {ListItemMetadata} from '@github-ui/list-view/ListItemMetadata'
import {ListItemTrailingBadge} from '@github-ui/list-view/ListItemTrailingBadge'
import {ListItem} from '@github-ui/list-view/ListItem'
import {
  settingsOrgSecurityProductsRepositoriesDeletePath,
  repoSettingsSecurityAnalysisPath,
  repositoryPath,
} from '@github-ui/paths'
import {useNavigate} from '@github-ui/use-navigate'
import {verifiedFetchJSON} from '@github-ui/verified-fetch'
import {
  Box,
  RelativeTime,
  Text,
  ActionList,
  ActionMenu,
  Button,
  Octicon,
  Flash as PrimerFlash,
  Spinner,
} from '@primer/react'
import {Blankslate} from '@primer/react/drafts'
import {Dialog} from '@primer/react/experimental'
import {AlertIcon, RepoIcon} from '@primer/octicons-react'
import ConfirmationDialog from './ConfirmationDialog'
import RepositoryConfigurationStatus from './RepositoryConfigurationStatus'
import {useRepositoryContext} from '../contexts/RepositoryContext'
import {useSelectedRepositoryContext} from '../contexts/SelectedRepositoryContext'
import type {
  Repository,
  OrganizationSecurityConfiguration,
  ConfigurationConfirmationSummary,
  PendingConfigurationChanges,
  ChangesInProgress,
} from '../security-products-enablement-types'
import {applyConfiguration, createDialogFooterButtons, confirmationSummary, dialogSize} from '../utils/dialog-helpers'
import {testIdProps} from '@github-ui/test-id-props'
import {useAppContext} from '../contexts/AppContext'

interface RepositoryTableProps {
  setChangesInProgress: React.Dispatch<React.SetStateAction<ChangesInProgress>>
  githubRecommendedConfiguration?: OrganizationSecurityConfiguration
  customSecurityConfigurations: OrganizationSecurityConfiguration[]
  filterQuery: string
  searchResultsLimitExceeded: boolean
  pageCount: number
  totalRepositoryCount: number
  isQueryLoading: boolean
}

// This is a work around to style the link for selecting and clearing all.
// This needs to be an inline style because there is a React class that overrides the GitHub `.btn-link` class.
// Once Primer addresses the "Select all" we can make this cleaner.
const selectAllStyle = {
  display: 'inline-block',
  padding: '0',
  fontSize: 'inherit',
  color: 'var(--fgColor-accent, var(--color-accent-fg))',
  textDecoration: 'none',
  cursor: 'pointer',
  backgroundColor: 'transparent',
  border: 'none',
  boxShadow: 'none',
}

const RepositoryTable: React.FC<RepositoryTableProps> = ({
  setChangesInProgress,
  githubRecommendedConfiguration,
  customSecurityConfigurations,
  filterQuery,
  searchResultsLimitExceeded,
  pageCount,
  totalRepositoryCount,
  isQueryLoading,
}) => {
  const navigate = useNavigate()
  const {organization, capabilities, docsUrls} = useAppContext()
  const {repositories, setRepositories, setRepositoryIds} = useRepositoryContext()
  const orgHasRepos = totalRepositoryCount > 0
  const {selectedReposMap, setSelectedRepos, selectedReposCount, setSelectedReposCount} = useSelectedRepositoryContext()
  const selectedRepoIds = Object.keys(selectedReposMap).map(Number)
  const hasSelectedRepos = selectedRepoIds.length > 0
  const [showConfirmationDialog, setShowConfirmationDialog] = useState<boolean>(false)
  const [showUpdateFailureConfirmationDialog, setShowUpdateFailureConfirmationDialog] = useState<boolean>(false)
  const [confirmationDialogSummary, setConfirmationDialogSummary] = useState<ConfigurationConfirmationSummary | null>(
    null,
  )
  const [pendingConfigurationChanges, setPendingConfigurationChanges] = useState({} as PendingConfigurationChanges)
  const [showNoConfigConfirmationDialog, setshowNoConfigConfirmationDialog] = useState<boolean>(false)

  useEffect(() => {
    setRepositoryIds(repositories.map(({id}) => id))
    setRepositories(repositories)
  }, [repositories, setRepositories, setRepositoryIds])

  const filterQueryEmpty = filterQuery.trim() === ''

  const spinnerAction = useMemo(
    () => ({
      key: 'spinner',
      render: () => <Spinner size="small" data-testid="spinner" />,
    }),
    [],
  )

  const actionsMenuItems = () => {
    let actions = []

    if (selectedRepoIds.length === repositories.length && pageCount > 1) {
      actions.push({
        key: 'select-all',
        render: () => (
          <div className="pr-2">
            <Button onClick={() => setAllReposAsSelected()} style={selectAllStyle}>
              Select all
            </Button>
          </div>
        ),
      })
    }

    if (orgHasRepos && selectedReposCount === totalRepositoryCount) {
      actions = [] // If select all button has been clicked, empty the actions menu

      actions.push({
        key: 'clear-selection',
        render: () => (
          <div className="pr-2">
            <Button onClick={() => clearAllReposAsSelected()} style={selectAllStyle}>
              Clear selection
            </Button>
          </div>
        ),
      })
    }

    // If we uncheck a repo, we need to remove the clear selection button
    if (selectedRepoIds.length !== repositories.length) actions = []

    if (hasSelectedRepos === true) {
      actions.push({
        key: 'apply-configuration',
        render: () => (
          <div className="pr-2">
            <ActionMenu>
              <ActionMenu.Button>Apply configuration</ActionMenu.Button>
              <ActionMenu.Overlay width="medium">
                <ActionList>
                  {githubRecommendedConfiguration && (
                    <ActionList.Item
                      sx={{span: {fontWeight: 'bold'}}}
                      onSelect={() =>
                        confirmConfigApplication(
                          githubRecommendedConfiguration,
                          true,
                          selectedReposCount === totalRepositoryCount,
                          filterQuery,
                        )
                      }
                    >
                      {githubRecommendedConfiguration.name}
                    </ActionList.Item>
                  )}
                  {customSecurityConfigurations.map(config => (
                    <ActionList.Item
                      sx={{span: {fontWeight: 'bold'}}}
                      key={config.id}
                      onSelect={() =>
                        confirmConfigApplication(config, true, selectedReposCount === totalRepositoryCount, filterQuery)
                      }
                    >
                      {config.name}
                    </ActionList.Item>
                  ))}
                  <ActionList.Divider />
                  <ActionList.Item onSelect={() => setshowNoConfigConfirmationDialog(true)}>
                    No configuration
                    <ActionList.Description variant="block">
                      <Text sx={{color: 'fg.muted'}}>
                        Detach configurations from selected repositories. This will not change repository settings.
                      </Text>
                    </ActionList.Description>
                  </ActionList.Item>
                </ActionList>
              </ActionMenu.Overlay>
            </ActionMenu>
          </div>
        ),
      })
    }

    return actions
  }

  const metadata = (
    <>
      <ListViewMetadata
        title={<Text sx={{fontWeight: 'bold'}}>{pluralize('repository', totalRepositoryCount, true)}</Text>}
        onToggleSelectAll={(isSelectAllChecked: boolean) => {
          if (isSelectAllChecked) {
            setSelectedRepos(repositories.reduce((acc, repo) => Object.assign(acc, {[repo.id]: repo}), {}))
            setSelectedReposCount(repositories.length)
          } else {
            clearAllReposAsSelected()
          }
        }}
        actionsLabel="Actions"
        actions={isQueryLoading ? [spinnerAction] : actionsMenuItems()}
      />

      {searchResultsLimitExceeded && (
        <PrimerFlash variant="warning" {...testIdProps('search-results-limit-exceeded-banner')}>
          <Octicon icon={AlertIcon} sx={{mr: 2}} />
          <Text sx={{fontWeight: 'bold'}}>configuration</Text>, <Text sx={{fontWeight: 'bold'}}>config-status</Text> and{' '}
          <Text sx={{fontWeight: 'bold'}}>team</Text> filters can only return up to 10,000 results. Try narrowing down
          search to see all results.
        </PrimerFlash>
      )}
    </>
  )

  const setAllReposAsSelected = () => {
    // Set the "X of X selected" text in the table header:
    setSelectedReposCount(totalRepositoryCount)

    // Mark all checkboxes on the table as set:
    setSelectedRepos(repositories.reduce((acc, repo) => Object.assign(acc, {[repo.id]: repo}), {}))
  }

  const clearAllReposAsSelected = () => {
    setSelectedReposCount(0)
    setSelectedRepos({})
  }

  const confirmConfigApplication = async (
    config: OrganizationSecurityConfiguration,
    overrideExistingConfig?: boolean,
    applyToAll?: boolean,
    repositoryFilterQuery?: string,
  ) => {
    setPendingConfigurationChanges({
      config,
      overrideExistingConfig,
      applyToAll,
      repositoryFilterQuery,
    })
    setShowConfirmationDialog(true)

    await confirmationSummary(
      setConfirmationDialogSummary,
      organization,
      overrideExistingConfig,
      applyToAll,
      selectedRepoIds,
      filterQuery,
      config.enable_ghas,
    )
  }

  const applyPendingConfigurationChanges = async () => {
    const result = await applyConfiguration(
      pendingConfigurationChanges,
      organization,
      navigate,
      'repos_table',
      selectedRepoIds,
    )

    if (result && result.status === 422) setShowUpdateFailureConfirmationDialog(true)
  }

  const detachConfiguration = async (applyToAll: boolean, repositoryFilterQuery?: string) => {
    const result = await verifiedFetchJSON(settingsOrgSecurityProductsRepositoriesDeletePath({org: organization}), {
      method: 'DELETE',
      body: {repository_ids: applyToAll ? [] : selectedRepoIds, repository_query: repositoryFilterQuery},
    })
    if (result.ok) {
      clearAllReposAsSelected()
      setChangesInProgress({inProgress: true, type: 'applying_configuration'})
    }
  }

  const onRepoSelectToggle = useCallback(
    (repo: Repository) => {
      const {[repo.id]: selectedRepo, ...otherRepos} = selectedReposMap
      const updatedSelectedRepos = selectedRepo ? {...otherRepos} : {...otherRepos, [repo.id]: repo}

      // If the "select all" button was previously clicked, filter out repositories not on the current page
      if (selectedRepoIds.length === totalRepositoryCount) {
        const currentPageRepos = repositories.filter(r => r.id !== repo.id)
        setSelectedRepos(currentPageRepos.reduce((acc, currentRepo) => ({...acc, [currentRepo.id]: currentRepo}), {}))
        setSelectedReposCount(currentPageRepos.length)
      } else {
        setSelectedRepos(updatedSelectedRepos)
        setSelectedReposCount(Object.keys(updatedSelectedRepos).length)
      }
    },
    [
      selectedReposMap,
      selectedRepoIds.length,
      totalRepositoryCount,
      repositories,
      setSelectedRepos,
      setSelectedReposCount,
    ],
  )

  const onCloseDialog = (dialogName: string) => {
    switch (dialogName) {
      case 'confirmation':
        setShowConfirmationDialog(false)
        setConfirmationDialogSummary(null)
        break
      case 'noConfig':
        setshowNoConfigConfirmationDialog(false)
        break
      default:
        // do nothing
        break
    }
  }

  const updateFailureConfirmationDialog = (
    <Dialog
      title="Unable to apply configuration"
      onClose={() => setShowUpdateFailureConfirmationDialog(false)}
      sx={dialogSize}
      footerButtons={createDialogFooterButtons({
        confirmOnClick: () => setShowUpdateFailureConfirmationDialog(false),
        confirmContent: 'Okay',
        confirmButtonType: 'default',
      })}
    >
      {'Another enablement is in progress. Please try again later.'}
    </Dialog>
  )

  const confirmationDialog = pendingConfigurationChanges?.config && (
    <Dialog
      title={'Apply configuration?'}
      onClose={() => onCloseDialog('confirmation')}
      sx={dialogSize}
      footerButtons={createDialogFooterButtons({
        cancelOnClick: () => onCloseDialog('confirmation'),
        confirmOnClick: () => {
          applyPendingConfigurationChanges()
          clearAllReposAsSelected()
          setChangesInProgress({inProgress: true, type: 'applying_configuration'})
          onCloseDialog('confirmation')
        },
        confirmContent: 'Apply',
      })}
    >
      <ConfirmationDialog
        confirmationDialogSummary={confirmationDialogSummary}
        pendingConfigurationChanges={pendingConfigurationChanges}
        hasPublicRepos={capabilities.hasPublicRepos}
        ghasPurchased={capabilities.ghasPurchased}
        docsBillingUrl={docsUrls.ghasBilling}
      />
    </Dialog>
  )

  const noConfigDialog = (
    <Dialog
      title="No configuration?"
      onClose={() => onCloseDialog('noConfig')}
      sx={dialogSize}
      footerButtons={createDialogFooterButtons({
        cancelOnClick: () => onCloseDialog('noConfig'),
        confirmOnClick: () => {
          detachConfiguration(selectedReposCount === totalRepositoryCount, filterQuery)
          onCloseDialog('noConfig')
          clearAllReposAsSelected()
        },
        confirmContent: 'No Configuration',
        confirmButtonType: 'danger',
      })}
    >
      This will detach configurations from the selected repositories. This will not change the repository settings and
      future changes to the configuration will no longer affect selected repositories.
    </Dialog>
  )

  return (
    <>
      {showConfirmationDialog && confirmationDialog}
      {showNoConfigConfirmationDialog && noConfigDialog}
      {showUpdateFailureConfirmationDialog && updateFailureConfirmationDialog}
      <Box
        sx={{border: '1px solid', borderColor: 'border.muted', borderRadius: 2}}
        data-action-bar-item="spinner"
        data-testid="repos-list"
      >
        <ListView
          isSelectable={orgHasRepos}
          title="Repositories"
          titleHeaderTag="h2"
          singularUnits="repository"
          pluralUnits="repositories"
          metadata={metadata}
          selectedCount={selectedReposCount}
          totalCount={totalRepositoryCount}
        >
          {repositories.map(repo => (
            <ListItem
              key={repo.id}
              title={
                <ListItemTitle
                  headingSx={{alignItems: 'baseline'}}
                  value={repo.name}
                  trailingBadges={[
                    <ListItemTrailingBadge key={repo.name} title={capitalize(repo.visibility)} variant="secondary" />,
                  ]}
                  href={repoSettingsSecurityAnalysisPath({repo: {name: repo.name, ownerLogin: organization}})}
                  linkProps={{
                    'data-hovercard-url': repositoryPath({owner: organization, repo: repo.name, action: 'hovercard'}),
                  }}
                />
              }
              metadata={
                <>
                  <ListItemMetadata>
                    <Text sx={{marginRight: 2}}>
                      <RepositoryConfigurationStatus repository={repo} />
                    </Text>
                  </ListItemMetadata>
                  {repo.licenses_required !== null && capabilities.ghasPurchased && (
                    <ListItemMetadata>
                      <span>{pluralize('license', repo.licenses_required, true)} required</span>
                    </ListItemMetadata>
                  )}
                </>
              }
              onSelect={() => onRepoSelectToggle(repo)}
              isSelected={!!selectedReposMap[repo.id]}
            >
              <ListItemMainContent>
                <ListItemDescription>
                  Updated <RelativeTime datetime={repo.pushed_at} />
                </ListItemDescription>
              </ListItemMainContent>
            </ListItem>
          ))}
        </ListView>

        {totalRepositoryCount < 1 && (
          <Blankslate>
            <Blankslate.Visual>
              <RepoIcon size={24} />
            </Blankslate.Visual>
            {filterQueryEmpty ? 'This organization has no repositories.' : 'No repositories matched your search.'}
          </Blankslate>
        )}
      </Box>
    </>
  )
}

export default RepositoryTable
