import type {PropertyValuesRecord, Repository} from '@github-ui/custom-properties-types'
import {human} from '@github-ui/formatters'
import {ListView} from '@github-ui/list-view'
import {ListItem} from '@github-ui/list-view/ListItem'
import {ListItemDescription} from '@github-ui/list-view/ListItemDescription'
import {ListItemDescriptionItem} from '@github-ui/list-view/ListItemDescriptionItem'
import {ListItemLeadingContent} from '@github-ui/list-view/ListItemLeadingContent'
import {ListItemLeadingVisual} from '@github-ui/list-view/ListItemLeadingVisual'
import {ListItemMainContent} from '@github-ui/list-view/ListItemMainContent'
import {ListItemMetadata} from '@github-ui/list-view/ListItemMetadata'
import {ListItemTitle} from '@github-ui/list-view/ListItemTitle'
import {ListViewMetadata} from '@github-ui/list-view/ListViewMetadata'
import {repoOverviewUrl} from '@github-ui/paths'
import {type Icon, PencilIcon, RepoIcon, RepoLockedIcon} from '@primer/octicons-react'
import {ActionList, Box, Button, IconButton, Pagination, Spinner, Text} from '@primer/react'
import {useCallback, useMemo} from 'react'

export function ReposPropertiesList({
  orgName,
  selectedRepoIds,
  repositoryCount,
  repos,
  pageCount,
  page,
  showSpinner,
  onSelectionChange,
  onPageChange,
  onEditRepoPropertiesClick,
}: {
  orgName: string
  selectedRepoIds: Set<number>
  repositoryCount: number
  repos: Repository[]
  pageCount: number
  page: number
  showSpinner: boolean
  onPageChange: (page: number) => void
  onSelectionChange: (selectedIds: Set<number>) => void
  onEditRepoPropertiesClick: (repositorySelections: Repository[], elementId: string) => void
}) {
  const onRepoSelectToggle = useCallback(
    (repo: Repository) => {
      const update = new Set(selectedRepoIds)
      if (selectedRepoIds.has(repo.id)) {
        update.delete(repo.id)
        onSelectionChange(update)
      } else {
        update.add(repo.id)
        onSelectionChange(update)
      }
    },
    [selectedRepoIds, onSelectionChange],
  )

  const selectedRepos = useMemo(() => repos.filter(repo => selectedRepoIds.has(repo.id)), [repos, selectedRepoIds])
  const hasSelectedRepos = selectedRepos.length > 0

  const metadata = (
    <ListViewMetadata
      onToggleSelectAll={isSelectAllChecked => {
        return isSelectAllChecked
          ? onSelectionChange(new Set(repos.map(repo => repo.id)))
          : onSelectionChange(new Set())
      }}
      title={<Text sx={{fontWeight: 'bold'}}>{reposCountLabel(repositoryCount)}</Text>}
      actionsLabel="Actions"
      actions={[
        {
          key: 'edit',
          render(isOverflowMenu) {
            if (!hasSelectedRepos) {
              return <></>
            }

            return isOverflowMenu ? (
              <ActionList.Item
                id="button:edit-multiple-repos"
                onSelect={() => onEditRepoPropertiesClick(selectedRepos, 'button:edit-multiple-repos')}
              >
                <ActionList.LeadingVisual>
                  <PencilIcon />
                </ActionList.LeadingVisual>
                Edit properties
              </ActionList.Item>
            ) : (
              <Button
                id="button:edit-multiple-repos"
                leadingVisual={PencilIcon}
                onClick={() => onEditRepoPropertiesClick(selectedRepos, 'button:edit-multiple-repos')}
              >
                Edit properties
              </Button>
            )
          },
        },
      ]}
    >
      {showSpinner && <Spinner size="small" sx={{mr: 2}} />}
    </ListViewMetadata>
  )

  return (
    <>
      <Box sx={{border: '1px solid', borderColor: 'border.muted', borderRadius: 2}} data-testid="repos-properties-list">
        <ListView
          isSelectable
          variant="compact"
          metadata={metadata}
          title="Repositories"
          titleHeaderTag="h2"
          singularUnits="repository"
          pluralUnits="repositories"
          totalCount={repos.length}
        >
          {repos.map(repo => (
            <ReposPropertiesListItem
              key={repo.id}
              {...repo}
              orgName={orgName}
              selected={selectedRepoIds.has(repo.id)}
              onEditButtonClick={buttonId => onEditRepoPropertiesClick([repo], buttonId)}
              onSelect={() => onRepoSelectToggle(repo)}
            />
          ))}
        </ListView>
      </Box>
      <Pagination
        pageCount={pageCount}
        currentPage={page}
        onPageChange={(e, newPage) => {
          // Avoid adding hash parameters
          e.preventDefault()

          window.scrollTo({top: 0, behavior: 'smooth'})
          onPageChange(newPage)
        }}
      />
    </>
  )
}

function ReposPropertiesListItem({
  name,
  orgName,
  description,
  properties = {},
  selected,
  visibility,
  onEditButtonClick,
  onSelect,
}: {
  name: string
  orgName: string
  description: string | null
  properties?: PropertyValuesRecord
  visibility: Repository['visibility']
  onEditButtonClick: (elementId: string) => void
  selected: boolean
  onSelect: () => void
}) {
  const buttonId = `list-item:button:edit-repo-${name}`
  const propertiesLength = Object.keys(properties).length

  return (
    <ListItem
      title={<ListItemTitle href={repoOverviewUrl({name, ownerLogin: orgName})} value={name} />}
      onSelect={onSelect}
      isSelected={selected}
      metadataContainerSx={{pr: 3}}
      metadata={
        <>
          <ListItemMetadata alignment="right" sx={{pl: 2, pr: 0}}>
            <span>
              {propertiesLength
                ? `${propertiesLength} ${propertiesLength === 1 ? 'property' : 'properties'}`
                : 'No properties'}
            </span>
          </ListItemMetadata>
          <ListItemMetadata alignment="right" variant="primary" sx={{p: 0}}>
            {/* eslint-disable-next-line primer-react/a11y-remove-disable-tooltip */}
            <IconButton
              unsafeDisableTooltip={true}
              id={buttonId}
              icon={PencilIcon}
              variant="invisible"
              aria-label={`Edit ${name}'s properties`}
              onClick={() => onEditButtonClick(buttonId)}
            />
          </ListItemMetadata>
        </>
      }
    >
      <ListItemLeadingContent>
        <ListItemLeadingVisual color="fg.muted" icon={visibilityMap[visibility]} />
      </ListItemLeadingContent>

      <ListItemMainContent>
        <ListItemDescription
          sx={{
            maxWidth: '100%',
            display: 'flex',
          }}
        >
          {description && (
            <ListItemDescriptionItem
              sx={{whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', display: 'block'}}
            >
              {description}
            </ListItemDescriptionItem>
          )}
        </ListItemDescription>
      </ListItemMainContent>
    </ListItem>
  )
}

const visibilityMap: Record<Repository['visibility'], Icon> = {
  private: RepoLockedIcon,
  public: RepoIcon,
  internal: RepoIcon,
}

function reposCountLabel(reposCount: number) {
  return `${human(reposCount)} ${reposCount === 1 ? 'repository' : 'repositories'}`
}
