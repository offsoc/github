import {GitHubAvatar} from '@github-ui/github-avatar'
import type {AssigneePickerAssignee$data as Assignee} from '@github-ui/item-picker/AssigneePicker.graphql'
import {userHovercardPath} from '@github-ui/paths'
import {ActionList, Box} from '@primer/react'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'

export type AssigneesProps = {
  assignees: Assignee[]
  sx?: BetterSystemStyleObject
  testId?: string
}

export function Assignees({assignees, testId}: AssigneesProps) {
  return (
    <ActionList sx={{py: 0}} variant={'full'}>
      {assignees.sort(sortByLogin).map(assignee => (
        <ActionList.LinkItem
          key={assignee.id}
          href={`/${assignee.login}`}
          target="_blank"
          data-hovercard-url={userHovercardPath({owner: assignee.login})}
        >
          <ActionList.LeadingVisual>
            <GitHubAvatar
              src={assignee.avatarUrl}
              size={20}
              alt={`@${assignee.login}`}
              key={assignee.id}
              sx={{boxShadow: '0 0 0 2px var(--bgColor-muted, var(--color-canvas-subtle))'}}
            />
          </ActionList.LeadingVisual>
          <Box sx={{mx: 0, width: '100%', fontSize: 0, fontWeight: '600'}} data-testid={testId}>
            {assignee.login}
          </Box>
        </ActionList.LinkItem>
      ))}
    </ActionList>
  )
}

function sortByLogin(a: Assignee, b: Assignee) {
  return a.login === b.login ? 0 : a.login > b.login ? 1 : -1
}
