import {ListView} from '@github-ui/list-view'
import {ListItemLeadingContent} from '@github-ui/list-view/ListItemLeadingContent'
import {ListItemTitle} from '@github-ui/list-view/ListItemTitle'
import {ListItemMetadata} from '@github-ui/list-view/ListItemMetadata'
import {ListItem} from '@github-ui/list-view/ListItem'
import {GitHubAvatar} from '@github-ui/github-avatar'
import type {BaseRepo} from './types'
import {IconButton} from '@primer/react'
import {TrashIcon} from '@primer/octicons-react'

interface Props {
  onRemove: (repo: BaseRepo) => void
  repos: BaseRepo[]
}

export function ListRepoList({onRemove, repos}: Props) {
  return (
    <ListView title="Repositories" variant="compact">
      {repos.map(repo => (
        <ListItem
          key={repo.nameWithOwner}
          metadata={
            <ListItemMetadata alignment="right">
              <IconButton
                aria-label="Remove from training set"
                icon={TrashIcon}
                tooltipDirection="s"
                variant="invisible"
                onClick={() => onRemove(repo)}
              />
            </ListItemMetadata>
          }
          sx={{'&:hover': {backgroundColor: 'inherit'}, border: 'none !important'}}
          title={<ListItemTitle value={repo.name} />}
        >
          <ListItemLeadingContent sx={{alignItems: 'center', display: 'flex'}}>
            <GitHubAvatar src={repo.owner.avatarUrl} square={repo.isInOrganization} size={16} />
          </ListItemLeadingContent>
        </ListItem>
      ))}
    </ListView>
  )
}
