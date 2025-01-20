import {Spinner} from '@primer/react'
import {ListView} from '@github-ui/list-view'
import {ListItemTitle} from '@github-ui/list-view/ListItemTitle'
import {ListItem} from '@github-ui/list-view/ListItem'
import {ListItemLeadingContent} from '@github-ui/list-view/ListItemLeadingContent'
import {RepoIcon} from '@primer/octicons-react'
import type {PipelineRepo} from '../../types'
import {ListItemLeadingVisual} from '@github-ui/list-view/ListItemLeadingVisual'

interface Props {
  isLoading: boolean
  repos: PipelineRepo[] | undefined
}

export function RepoListView({isLoading, repos}: Props) {
  if (isLoading) return <Spinner size="small" sx={{m: '10px', mb: '11px'}} />

  return (
    <ListView title="Repositories" variant="compact">
      {repos?.length ? (
        repos.map(r => (
          <ListItem key={r.id} sx={{'&:hover': {backgroundColor: 'inherit'}}} title={<ListItemTitle value={r.name} />}>
            <ListItemLeadingContent>
              <ListItemLeadingVisual aria-label="Repository" color="fg.muted" icon={RepoIcon} />
            </ListItemLeadingContent>
          </ListItem>
        ))
      ) : (
        <ListItem title={<ListItemTitle value="No repositories matching filter" />} />
      )}
    </ListView>
  )
}
