import {PercentageCircle} from '@github-ui/percentage-circle'
import {Box, Label, Text} from '@primer/react'
import {graphql, useFragment} from 'react-relay'

import {LABELS} from '../../constants/labels'
import {ChecklistIcon} from '@primer/octicons-react'
import type {FC} from 'react'
import type {TaskListStatusFragment$key} from './__generated__/TaskListStatusFragment.graphql'

type TaskListStatus = {
  taskListSummary: {
    itemCount: number
    completeCount: number
  }
  tasklistBlocksCompletion: {
    completed: number
    total: number
  }
}

type TaskListStatusProps = {
  isSmall?: boolean
  taskListStatusKey?: TaskListStatusFragment$key
}

export const TaskListStatusFragment = graphql`
  fragment TaskListStatusFragment on Issue {
    taskListSummary {
      itemCount
      completeCount
    }
    tasklistBlocksCompletion {
      completed
      total
    }
  }
`

export const SmallTaskListStatus: FC<TaskListStatusProps> = props => <TaskListStatus {...props} isSmall={true} />

export function TaskListStatus({taskListStatusKey, isSmall = false}: TaskListStatusProps) {
  const data = useFragment(TaskListStatusFragment, taskListStatusKey)
  if (!data) {
    return null
  }

  const {taskListSummary, tasklistBlocksCompletion} = data
  if (!tasklistBlocksCompletion && !taskListSummary) return null

  // If tasklist block is deleted but there's still a checklist, we need to check if
  // the tasklist block total is zero, in order to show the progress bar for checklist instead
  const hasTaskListBlock = tasklistBlocksCompletion && tasklistBlocksCompletion.total > 0

  let total
  let completed

  if (hasTaskListBlock) {
    total = tasklistBlocksCompletion.total
    completed = tasklistBlocksCompletion.completed
  } else if (taskListSummary) {
    total = taskListSummary.itemCount
    completed = taskListSummary.completeCount
  } else {
    return null
  }

  const progress = completed / total
  if (total === 0 || Object.is(NaN, progress)) return null

  const insideContent = (
    <Box
      data-testid="small-tasklist-progress"
      sx={{alignItems: 'center', display: 'flex', flexDirection: 'row', gap: 1}}
    >
      {!hasTaskListBlock && completed === 0 ? (
        <>{!isSmall && <ChecklistIcon size={16} />}</>
      ) : (
        <PercentageCircle progress={progress} radius={7} isSuccess />
      )}

      <Text sx={{fontSize: 0, fontWeight: 'normal'}}>{LABELS.tasks(completed, total)}</Text>
    </Box>
  )

  if (isSmall) {
    return <Box sx={{display: 'flex', flexDirection: 'row'}}>{insideContent}</Box>
  }

  return (
    <>
      <Box
        sx={{
          whiteSpace: 'nowrap',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 1,
          verticalAlign: 'middle',
        }}
      >
        <Box data-testid="tasklist-progress" as="span" sx={{display: 'inline-flex', alignItems: 'center'}}>
          <Label sx={{color: 'fg.muted', px: 'var(--control-small-paddingInline-normal)', height: '32px'}}>
            {insideContent}
          </Label>
        </Box>
      </Box>
    </>
  )
}
